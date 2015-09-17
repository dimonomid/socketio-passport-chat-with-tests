'use strict';

/**
 * Perform user login.
 *
 * @param {Object} agent
 *    Agent instance returned by supertest.agent(app)
 * @param {String} username
 * @param {String} password
 * @param {Function} callback
 *    Optional.
 *    If provided, this callback is called when authentication is successful.
 *    It takes 3 arguments:
 *
 *      - res: express's response
 *      - done: callback that must be called when callback is finished
 *        its job
 *      - cbData: arbitrary user data provided as next argument
 *
 * @param {Mixed} cbData
 *    Optional.
 *    Arbitrary user data that is given to callback
 */
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

/**
 * Perform user logout.
 *
 * @param {Object} agent
 *    Agent instance returned by supertest.agent(app)
 */
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

