"""
    File containing all globally used helper functions
"""
# Libraries
import functools, re, smtplib, random, jwt, os, colored, hashlib
from dotenv import load_dotenv
from colored import stylize

# Source files:
from exceptions import AccessError
from models import User, Channel, Bio, MemberOf, Message
from database import db

# Globals and config:
load_dotenv()
SECRET_MESSAGE = os.getenv("SECRET_MESSAGE")
SECRET_CODE = hashlib.sha256(SECRET_MESSAGE.encode()).hexdigest()

# ===== Debugging Utilities =====
def printColour(text, colour="green", bordersOn=True):
    """
        Given a string and a colour keyword, prints the string with the colour applied.
        See a list of all the available 256 colours: https://pypi.org/project/colored/
    """
    if bordersOn:
        print(stylize("|============================================|", colored.fg(colour)))
        print(stylize(text, colored.fg(colour)))
        print(stylize("|============================================|", colored.fg(colour)))
    else:
        print(stylize(text, colored.fg(colour)))
        
def funcDebugBorders(func):
    """ 
        A simple decorator that adds a start and end marker for a function call.
        Meant for debugging functions.
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        args_repr = [repr(a) for a in args]   
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]    
        signature = ", ".join(args_repr + kwargs_repr)   
        print(f"=====* Start of {func.__name__}({signature}) *=====")
        func(*args, **kwargs)
        print(f"=====*  End of {func.__name__}  *=====")
    # The function is now wrapped by two additional print statements
    return wrapper

# ===== Input Validators =====
def email_is_legit(email):
    """
        Given a string, determines if it matches the standard email regex.
    """
    regex = r'^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$'
    return bool(re.search(regex, email))

# ===== Token Functions =====
def generate_token(user_data):
    """
        Generates a unique JSON web token.
        Parameters:
            user_data: { 
                email: str,
                username: str,
                profile_img_url: str
            }
        Returns:
            web_token    str
    """
    payload = {
        "email": user_data.email,
        "username": user_data.username,
        "profile_img_url": user_data.bio.profile_img_url
    }
    web_token = jwt.encode(payload, SECRET_MESSAGE, algorithm="HS256").decode("utf-8")
    return web_token

def verify_token(token):
    """
        Given a token, checks the database and returns true if the token exists.
        If the token doesn't exist, then return false.
        Unfortunately, we need to check ourselves whether that user_id associated with
        the token has access rights, etc.
        Parameters:
            token   str
        Returns:
            True/False
    """
    try:
        jwt.decode(token, os.getenv("SECRET_MESSAGE"), algorithms=["HS256"])
        return True
    except jwt.DecodeError:
        # Token is invalid!
        raise AccessError(description="Token is invalid! {}".format(token))

def get_user_from_token(token):
    """
        Given a token, checks if it exists. If it does, return the user data structure
        associated with the token. If not, return None
        Parameters:
            token       str
        Returns: {
            user_id             int
            username            str
            email               str
            password(hashed)    str
            permission_id       int
        }
    """
    decoded_token = jwt.decode(token, os.getenv("SECRET_MESSAGE"), algorithms=["HS256"])
    User.query.filter_by(id=decoded_token["user_id"]).first()

# ===== User Utilities =====
def is_user_member(user, selected_channel):
    """
        Returns True if user is a member of the selected channel, False otherwise.
        Parameters:
            user             obj
            selected_channel obj
        Returns: True/False
    """
    

def get_user_from_id(users_list, user_id):
    """
        Checks whether user_id is in user list and returns (is_valid_user, is_user_admin, user_to_add)
        whether user_id is in user list, whether user is global admin and the details of the user
        Parameters:
            users_list      list of user objects
            user_id            integer
        Returns: (
            is_valid_user   boolean
            is_user_admin   boolean
            user_to_add     dictionary
        )
    """
    is_valid_user = False
    is_user_admin = False
    user_to_add = None
    for user in users_list:
        # retrieve information about user
        if user.user_id == user_id:
            is_valid_user = True
            if user.permission_id == 1:
                is_user_admin = True
            user_to_add = {
                "user_id": user_id,
                "email": user.email,
                "profile_img_url": user.profile_img_url
            }
            break
    return (is_valid_user, is_user_admin, user_to_add)

# ===== Password Reset Utilities =====
# TODO:
def send_email(send_to, gmail_user, gmail_password, msg):
    """
        Function which sends mail from gmail account
        Parameters (send_to, gmail_user, gmail_password, msg):
        types:
        send_to           string
        gmail_user        string
        gmail_password    string
        msg               string

        returns nothing
    """
    smtpserver = smtplib.SMTP("smtp.gmail.com", 587)
    smtpserver.ehlo()
    smtpserver.starttls()
    smtpserver.login(gmail_user, gmail_password)
    smtpserver.sendmail(gmail_user, send_to, msg)
    smtpserver.close()

# TODO:
def email_message(email, reset_code, name_first, name_last):
    """
        Message contents of email sent to reset password
        Parameters:
            email       str
            reset_code  str
            name_first   str
            name_last    str
        Returns:
            message str
    """
    return "TODO"

# ===== Message Utilities =====
def get_message(data, message_id):
    """
    Gets message details according to message_id
    Parameters:
        data        dict
        message_id  int
    Returns:
        selected_message    dict
    """
    channels_list = data["channels"]
    for channel in channels_list:
        for message in channel["messages"]:
            if message["message_id"] == message_id:
                selected_message = message
                return selected_message
    #returns None if invalid id is given
    return None

# ===== Channel Utilities =====
def determine_channel(message_id):
    """
    Determine which channel the message is in, returns None on error
    Parameters:
        message_id  int
    Returns:
        selected_channel    dict
    """
    channels_list = data["channels"]
    for channel in channels_list:
        for message in channel["messages"]:
            if message["message_id"] == message_id:
                selected_channel = channel
                return selected_channel
    #returns None if message is not in channel
    return None

def select_channel(channel_id):
    """ 
        Returns the channel object associated with the given channel_id, 
        if it exists.
    """
    return Channel.query.filter_by(id=channel_id).first()
