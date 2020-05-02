import json
from flask import Flask, render_template, request, jsonify, url_for, redirect

import utils

app = Flask(__name__)

FILEPATH = 'gender-equality-index-2005-2010-2012-2015.xlsx'

@app.route('/', methods=['GET', 'POST'])
def main():
   return render_template('index.html')

@app.route('/getpythondata', methods=['GET', 'POST'])
def get_python_data():
    dr = utils.DataReader(FILEPATH)
    return dr.jsonify()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
