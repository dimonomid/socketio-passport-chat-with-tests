
# Socket.io and Passport chat

This is an example socket.io application. As is often the case with socket.io examples, it's a chat application. But, unlike most other socket.io examples, it uses real authentication with Passport, and the authentication data is available in socket connection.

The main purpose of writing this application is to demonstrate the technique of testing socket.io with passport. The main article is here: [Testing Socket.io with Passport.socketio](http://dmitryfrank.com/articles/socketio_passport_tutorial).

## Usage

You need running mongodb daemon for the application to work.

Clone the repository, `cd` to it, and then:

```
npm install
bower install
npm start
```

You'll be able to login with the following credentials:

- login: **test1** | password: **1**
- login: **test2** | password: **2**

And post something.

## Tests

Just run:

```
npm test
```

