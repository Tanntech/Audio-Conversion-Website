from flask import Flask, request, render_template, jsonify
import os
import subprocess
from pydub import AudioSegment, effects

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.after_request
def add_header(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response  

audio_counter = 1

def log_audio_properties(audio_segment, label):
    print(f"{label} - Duration: {len(audio_segment)} ms, Channels: {audio_segment.channels}, Frame Rate: {audio_segment.frame_rate}")

def convert_audio_to_16k_wav(audio_input):
    sound = AudioSegment.from_file(audio_input)
    log_audio_properties(sound, "Original Audio")
    
    # Save the original audio for inspection
    original_output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'original_' + os.path.basename(audio_input))
    sound.export(original_output_path, format="wav")
    
    sound = sound.set_channels(1).set_frame_rate(16000)
    sound = effects.normalize(sound)
    log_audio_properties(sound, "Converted Audio")
    
    filename = os.path.splitext(os.path.basename(audio_input))[0] + "_16k.wav"
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    sound.export(output_path, format="wav")
    return output_path

def run_my_code(audio_path, language):
    language_map = {
        "Gujarati": ("static/models/gj_m.pt", "static/lang/gj", 'gu'),
        "Hindi": ("static/models/hi_m.pt", "static/lang/hi", 'hi'),
        "Bengali": ("static/models/bn_m.pt", "static/lang/bn", 'bn'),
        "Nepali": ("static/models/ne_m.pt", "static/lang/ne", 'ne'),
        "Tamil": ("static/models/tm_m.pt", "static/lang/tm", 'ta'),
        "Marathi": ("static/models/mt_m.pt", "static/lang/mt", 'mr')
    }

    if language not in language_map:
        return "Error: Unsupported language"

    model_checkpoint, data_root, lang = language_map[language]

    with open('input.txt', 'w', encoding='utf-8') as f:
        f.write(audio_path)

    try:
        env = os.environ.copy()
        env["PATH"] = f"/home/tanishqa/miniconda3/envs/myenv/bin:{env['PATH']}"

        translation_result = subprocess.run(
            ["/home/tanishqa/miniconda3/envs/myenv/bin/fairseq-interactive", data_root, 
             "--config-yaml", "config_st.yaml", "--task", "speech_to_text", "--path", model_checkpoint, 
             "--max-tokens", "50000", "--beam", "5", "--input", "input.txt"],
            capture_output=True, text=True, check=True, env=env
        )

        translation_result_text = translation_result.stdout
        lines = translation_result_text.split("\n")

        for line in lines:
            if line.startswith("D-0"):
                output_text = line.split("\t")[2]
                return output_text

        return "Error: No translation output found."

    except subprocess.CalledProcessError as e:
        return f"Error: Translation subprocess failed. {e}"
    except FileNotFoundError as fnf_error: 
        return "Error: fairseq-interactive not found."
    except Exception as e:
        return f"Error: Unexpected error during translation. {e}"

@app.route('/')
def index():
    return render_template('voice2 copy.html')

@app.route('/upload', methods=['POST'])
def upload():
    global audio_counter
    if 'audio_data' in request.files:
        audio_file = request.files['audio_data']
        if audio_file.filename != '':
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"recorded_audio{audio_counter}.wav")
            audio_file.save(file_path)
            audio_counter += 1

            language = request.form.get('language')
            converted_file_path = convert_audio_to_16k_wav(file_path)
            translation_output = run_my_code(converted_file_path, language)

            return jsonify(translated_text=translation_output)

    return 'No audio file provided.', 400

@app.route('/upload.html')
def display_translation():
    translated_text = request.args.get('translated_text', '')
    return render_template('Uploads.html', Translated_text=translated_text)

if __name__ == '__main__':
    app.run(debug=True)
