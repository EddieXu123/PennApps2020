import numpy as np
from skimage import color
import flask                                  # web dev framework to set up an endpoint for our http reqquest
#from flask_cors import CORS                   # enables cross origin resource sharing
from convert_hex_2_color import convert_to_color 

app = flask.Flask(__name__)
#CORS(app)

@app.route('/convert_to_color', methods=['POST'])
def predict():

	# Get our sentence from the POST request
	data = flask.request.get_json(force=True)
	print(data)
	hex_value = data['hex_value']
	output = convert_to_color(hex_value)

	# Return our prediction as a JSON object
	json_output = flask.jsonify(str(output))
	return json_output

app.run()
