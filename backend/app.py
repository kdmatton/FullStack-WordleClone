from flask import Flask, jsonify
from flask_cors import CORS
import requests  

app = Flask(__name__)
CORS(app)

@app.route('/getWord', methods=['GET'])
def get_word():
    url = "https://random-word-api.herokuapp.com/word?length=5"

    response = requests.get(url)
    
    word = response.json()[0] 
    print(f"Generated word: {word}")
    return jsonify({"word": word.upper()})
    

if __name__ == '__main__':
    app.run(port=5000, debug=True)
