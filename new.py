from flask import Flask, request, render_template, jsonify
import os
import subprocess
from pydub import AudioSegment

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = r'/mnt/d/IIT-Project/Audio-Conversion-Website'

# Add X-Content-Type-Options header to all responses
@app.after_request
def add_header(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response
 
audio_counter = 1  # Counter to generate unique file names

def convert_audio_to_16k_wav(audio_input):
    sound = AudioSegment.from_file(audio_input)
    sample_rate = sound.frame_rate
    num_channels = sound.channels
    filename = audio_input.split("/")[-1]
    print("Original file is at:", audio_input)
    
    if num_channels > 1 or sample_rate != 16000:
        if num_channels > 1:
            sound = sound.set_channels(1) 
        if sample_rate != 16000:
            sound = sound.set_frame_rate(16000)
        filename = filename.replace(".wav", "") + "_16k.wav"
        sound.export(f"{filename}", format="wav")
    return filename

def run_my_code(input_text, language):
    print("Input text:", input_text)
    audio = convert_audio_to_16k_wav(input_text)
    hi_wav = audio

    language_map = {
        "Gujrati": ("static/models/gj_m.pt", "static/lang/gj", 'gu'),
        "Hindi": ("static/models/hi_m.pt", "static/lang/hi", 'hi'),
        "Bengali": ("static/models/bn_m.pt", "static/lang/bn", 'bn'),
        "Nepali": ("static/models/ne_m.pt", "static/lang/ne", 'ne'),
        "Tamil": ("static/models/tm_m.pt", "static/lang/tm", 'ta'),
        "Marathi": ("static/models/mt_m.pt", "static/lang/mt", 'mr')
    }

    if language not in language_map:
        print("Unsupported language:", language)
        return "Error: Unsupported language"

    model_checkpoint, data_root, lang = language_map[language]

    with open('input.txt', 'w', encoding='utf-8') as f:
        f.write(hi_wav)

    try:
        print("------Performing translation...")
        FAIRSEQ_INTERACTIVE_PATH = '/home/tanishqa/miniconda3/envs/myenv/bin/fairseq-interactive'
        print(f"Using fairseq-interactive at: {FAIRSEQ_INTERACTIVE_PATH}")

        # Ensure the PATH environment variable includes the directory of fairseq-interactive
        env = os.environ.copy()
        env["PATH"] = f"/home/tanishqa/miniconda3/envs/myenv/bin:{env['PATH']}"

        translation_result = subprocess.run(
            [FAIRSEQ_INTERACTIVE_PATH, data_root, "--config-yaml", "config_st.yaml", "--task", "speech_to_text", "--path", model_checkpoint, "--max-tokens", "50000", "--beam", "5", "--input", "input.txt"],
            capture_output=True,
            text=True,
            check=True,
            env=env
        )

        translation_result_text = translation_result.stdout
        lines = translation_result_text.split("\n")

        output_text = ""
        print("\n------Translation results are:")

        for line in lines:
            if line.startswith("D-0"):
                print(line.split("\t")[2])
                output_text = line.split("\t")[2]
                break

        if not output_text:
            print("No translation output found.")
            return "Error: No translation output found."

        print("Output Text:", output_text)
        return output_text

    except subprocess.CalledProcessError as e:
        print("Subprocess error:", e)
        print("Subprocess stdout:", e.stdout)
        print("Subprocess stderr:", e.stderr)
        return "Error: Translation subprocess failed."

    except FileNotFoundError as fnf_error: 
        print("FileNotFoundError:", fnf_error)
        return "Error: fairseq-interactive not found."

    except Exception as e:
        print("Error during translation:", e)
        return "Error: Unexpected error during translation."

@app.route('/')
def index():
    return render_template('voice2.html')

@app.route('/upload', methods=['POST'])
def upload():
    print("Form Data:", request.form)
    print("File Data:", request.files)
    global audio_counter
    if 'audio_data' in request.files:
        audio_file = request.files['audio_data']
        if audio_file.filename != '':
            filename = f"recorded_audio{audio_counter}.mp3"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
            audio_file.save(file_path)
            audio_counter += 1
            
            language = request.form.get('language')
            print("Selected language:", language)
            
            print("a")
            converted_filename = convert_audio_to_16k_wav(file_path)

            print("b")
            translation_output = run_my_code(converted_filename, language)
            
            print("This is Translated Text", translation_output)

            return jsonify(translated_text=translation_output)

    return 'No audio file provided.', 400

@app.route('/upload.html')
def display_translation():
    translated_text = request.args.get('translated_text', '')
    return render_template('Uploads.html', Translated_text=translated_text)

if __name__ == '__main__':
    app.run(debug=True)