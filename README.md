content-languages
=================
Proof of concept for a new HTTP header named 'content-languages', which allows a server to return whether the requested content is available in different languages. 

The project exists out of a Google Chrome extension which allows the user to transparently select the language to request the current content in, and a simple PHP script to perform content-negotiation based on the 'accept-language' header. 
