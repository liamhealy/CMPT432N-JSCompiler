import re
from templates import *

class Token:
    # Here, we define what a token is based on Our Project Grammar.
    def __init__(self, name, text = None):
        #The name of any token will begin with "t_", such as "t_Statement"
        self.name = name

        self.text = text
