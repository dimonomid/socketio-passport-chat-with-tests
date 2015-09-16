'use strict';

module.exports.agentLogin = function(agent, username, password, callback, cbData) {
  it('Should log in as ' + username, function(done){
    agent
    .post('/api/login')
    .send(
      {
        username: username,
        password: password
      }
    )
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res){
      if (err){
        throw err;
      }

      //-- if callback is provided, then call it and give `done` function
      //   to it. The callback **must** call done() eventually, either
      //   directly or indirectly.
      //
      //   If no callback is provided, just call done() right here.
      if (callback){
        callback(res, done, cbData);
      } else {
        done();
      }
    })
    ;
  });
}

module.exports.agentLogout = function(agent) {
  it('Should log out', function(done){
    agent
    .get('/api/logout')
    .expect(200)
    .end(function(err, res){
      if (err){
        throw err;
      }
      done();
    })
    ;
  });
}

