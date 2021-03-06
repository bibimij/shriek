var LoginComponent = function(socket) {
  // LOGIN ERROR MODULE
  var LoginError = require('../../views/components/login-error.jsx')(socket);

  // LOGIN DEFAULT MODULE
  var LoginDefault = require('../../views/components/login-default.jsx')(socket);

  // LOGIN PASSPORT MODULE
  var LoginPassport = require('../../views/components/login-passport.jsx')(socket);

  // ALT-JS STORE INIT
  var AuthStore = require('./../../stores/AuthStore')(socket);
  var AuthActions = require('./../../actions/AuthActions');


  // askLogin component
  var AskLogin = React.createClass({

    getInitialState: function () {
      var state = Boolean(localStorage.userName);

      return {
        logged: state,
        userInit: true,
        passInit: true,
        userInvalid: false,
        passInvalid: false,
        error: false,
        passportInit: false,
        passportUser: false
      };
    },

    componentDidMount: function () {

      AuthStore.listen(this.onChange); // подписываемся на изменения store

      var username;
      var storageUser = localStorage.userName;
      var storagePass = localStorage.userPass;
      var _this = this;

      if (storageUser != null && storagePass != null) {
        socket.emit('user enter', {
          username: storageUser,
          password: storagePass
        });
      }

      // cookie helper: read
      function readCookie (name) {
          var nameEQ = name + "=";
          var ca = document.cookie.split(';');

          for(var i=0; i < ca.length; i++) {
              var c = ca[i];
              while (c.charAt(0)==' ') c = c.substring(1, c.length);
              if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
          }

          return null;
      }

      // cookie helper: delete
      var deleteCookie = function (name) {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      };

      // if auth through passport
      var psUser = readCookie('psUser');
      var psInit = readCookie('psInit');

      if (psUser != null && psInit != null) {
        this.setState({passportInit: true});
        this.setState({passportUser: psUser});
      } else if (psUser != null) {
        socket.emit('user enter', {
          username: psUser,
          oAuth: true
        });
      }

      if (this.state.passportInit) {
        deleteCookie('psUser');
        deleteCookie('psInit');
      }

      socket.on('user enter', function(data) {
        if (data.status == 'ok') {
          _this.setState({
            logged: true
          });

          socket.username = data.user.username;

          socket.emit('user list');
          socket.emit('channel list');

          socket.emit('channel join', {
            channel: 'general'
          });

          // Load info about current user
          socket.emit('user info', {username: socket.username});
          localStorage.setItem('userName', data.user.username);
          localStorage.setItem('userPass', data.user.hashedPassword);
        } else {
          _this.setState({error: data.error_message});
        }
      });
    },

    componentWillUnmount: function () {
      AuthStore.unlisten(this.onChange); // отписываемся от изменений store
    },

    // эта функция выполняется когда store триггерит изменения внутри себя
    onChange: function (state) {
      this.setState(state);
    },

    handleNameChange: function(e) {
      this.setState({name: e.target.value});
      this.setState({userInit: false});

      if (!e.target.value.length || e.target.value.length < 6) {
        this.setState({userInvalid: true});
      } else {
        this.setState({userInvalid: false});
      }
    },

    handlePasswordChange: function(e) {
      this.setState({password: e.target.value});
      this.setState({passInit: false});

      if (!e.target.value.length) {
        this.setState({passInvalid: true});
      } else {
        this.setState({passInvalid: false});
      }
    },

    handleLogin: function(e) {
      e.preventDefault();
      if (this.state != null ) {
        // passport login
        if (this.state.passportInit) {
          socket.emit('user enter', {username: this.state.passportUser,
            password: this.state.password, passportInit: true})
        }

        // local login
        if (!this.state.userInit && !this.state.passInit) {
          if (!this.state.passInvalid && !this.state.userInvalid) {
            socket.emit('user enter', {username: this.state.name,
             password: this.state.password});
          }
        } else if(this.state.userInit && this.state.passInit) {
          this.setState({userInvalid: true});
          this.setState({passInvalid: true});
        } else if(this.state.passInit) {
          this.setState({passInvalid: true});
        } else {
          this.setState({userInvalid: true});
        }
      }
    },

    render: function() {
      var cx = require('classnames');
      var classesUser = cx({
        'form__text': true,
        'invalid': this.state.userInvalid
      });
      var classesPassword = cx({
        'form__text': true,
        'invalid': this.state.passInvalid
      });

      return (
        <div>
          {this.state.logged == false && (
            <div className="modal login__box">
              <form className="form modal__body" onSubmit={this.handleLogin}>
                <div className="form__row">
                  {this.state.error && (
                    <LoginError error={this.state.error} />
                  )}
                </div>
                {!this.state.passportInit && (
                  <LoginDefault classUser={classesUser} classPass={classesPassword} handleName={this.handleNameChange} handlePassword={this.handlePasswordChange} />
                )}
                {this.state.passportInit && (
                  <LoginPassport classPass={classesPassword} handlePassword={this.handlePasswordChange}/>
                )}
              </form>
            </div>
          )}
        </div>
      );
    }
  });

  return AskLogin;
};

module.exports = LoginComponent;
