# from datetime import datetime
# lang_bn_config_st
# lang_bn_
from flask import Flask, flash, request,render_template, redirect, url_for
from werkzeug.utils import secure_filename
import sys
import os
import subprocess  
from pydub import AudioSegment

# changes
os.sys.stdin.reconfigure(encoding='utf-8')
os.sys.stdout.reconfigure(encoding='utf-8')

# UPLOAD_FOLDER = r'static/upload'
UPLOAD_FOLDER = r'/mnt/d/IIT-Project/Audio-Conversion-Website'

ALLOWED_EXTENSIONS = {"mp3", '3gp', 'm4a', 'wav' , 'm3u' , 'ogg'}

app = Flask(__name__)
app.config['SECRET_KEY']= 'supersecretkey' 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def convert_audio_to_16k_wav(audio_input):
    sound = AudioSegment.from_file(audio_input)
    sample_rate = sound.frame_rate
    num_channels = sound.channels
    num_frames = int(sound.frame_count())
    filename = audio_input.split("/")[-1]
    print("original file is at:", audio_input)
    
    if (num_channels > 1) or (sample_rate != 16000): # convert to mono-channel 16k wav
        if num_channels > 1:
            sound = sound.set_channels(1)
        if sample_rate != 16000:
            sound = sound.set_frame_rate(16000)
        num_frames = int(sound.frame_count())
        filename = filename.replace(".wav", "") + "_16k.wav"
        sound.export(f"{filename}", format="wav")
    return filename

def run_my_code(input_text, language):
    # TODO better argument handling
    print(input_text)
    audio=convert_audio_to_16k_wav(input_text)
    hi_wav = audio

    data_root=""
    model_checkpoint=""
    d_r=""
    lang=''

    if(language=="Gujrati"):
        model_checkpoint = "static/models/gj_m.pt"
        data_root="static/lang/gj"
        lang='gu'

    elif(language=="Hindi"):
        model_checkpoint = "static/models/hi_m.pt"
        data_root="static/lang/hi"
        lang='hi'

    elif(language=="Bengali"):
        model_checkpoint = "static/models/bn_m.pt"
        data_root="static/lang/bn"      
        lang='bn'  
        print("bengali")

    elif(language=="Nepali"):
        model_checkpoint = "static/models/ne_m.pt"
        data_root="static/lang/ne"
        lang='ne'

    elif(language=="Tamil"):
        model_checkpoint = "static/models/tm_m.pt"
        data_root="static/lang/tm"
        lang='ta'

    elif(language=="Marathi"):
        model_checkpoint = "static/models/mt_m.pt"
        data_root="static/lang/mt" 
        lang='mr'       
        # (language=="Marathi"):

    else:
        print("Unsupported language:", language)
        return "Error: Unsupported language"

    with open('input.txt', 'w', encoding='utf-8') as f:
        f.write(hi_wav)

    with open('input.txt', 'r') as f:
        content = f.read()

    print("checking this line")
    print(content)
    print(hi_wav)

    print("------Performing translation...")
    translation_result = subprocess.run(["fairseq-interactive", data_root, "--config-yaml", "config_st.yaml", "--task", "speech_to_text", "--path", model_checkpoint, "--max-tokens", "50000", "--beam", "5" ,"--input" ,"input.txt"], capture_output=True, text=True)
    # translation_result = subprocess.run(["fairseq-interactive", data_root, "--config-yaml", "config_st.yaml", "--task", "speech_to_text", "--path", model_checkpoint, "--max-tokens", "50000", "--beam", "5" ,"--input" ,"input.txt"], capture_output=True, text=True)

    translation_result_text = translation_result.stdout
    lines = translation_result_text.split("\n")

    output_text=""
    print("\n\n------Translation results are:")

    # print(lines)
    for i in lines:
        if (i.startswith("D-0")):
            print(i.split("\t")[2])
            output_text=i.split("\t")[2]
            break

    # output_text="हाय, हैलो। आप कैसे कर रहे हैं?"
    #os.system(f"rm test.wav")
        
    with open('input.txt', 'w', encoding='utf-8') as f:
        f.write("")

    with open('input.txt', 'r', encoding='utf-8') as f:
         content = f.read()
         print(content)

    print("helllloooooo")

    return output_text

# actual code

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
             
        file = request.files['file']
        language = request.form['language']
        # If the user does not select a file, the browser submits an empty file without a filename.
        if file.filename == '':
            return render_template('Choose.html')

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            # return redirect(url_for('download_file', name=filename))
            # return 'File uploaded successfully'
            print("a")
            converted_filename = convert_audio_to_16k_wav(file_path)

            print("b")
            translation_output = run_my_code(converted_filename, language)
            
            print("converted")
            print(translation_output)

            return render_template('Uploaded.html', Translated_text = translation_output)

        else:
            return render_template('Extension.html')
    
    return render_template('index.html')
    # return redirect(url_for('allowed_file'))
    # return 'hello'

@app.route('/pricing')
def pricing():
    return render_template('pricing.html')

@app.route('/Home')
def Home():
    return render_template('Home.html')
    # return redirect("/Home")

@app.route('/')
def index():
    return render_template('index.html')
#     # return redirect("/index" )

@app.route('/SignIn')
def SignIn():
    return render_template('SignIn.html')

    
if __name__ == "__main__":
    # app.run(debug=False,host='0.0.0.0')
    app.run(debug=True)



