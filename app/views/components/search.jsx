var SearchComponent = function (socket) {

var ChannelsStore = require('./../../stores/ChannelsStore')(socket); // подключаем стор

  var SearchBlock = React.createClass({

    getInitialState: function () {
      return {};
    },

    handleSearch: function (e) {
      e.preventDefault();

      var searchBox = $('#search');
      var searchQuery = searchBox.val().trim();

      if (searchQuery) {
        var chList = ChannelsStore.getState().channels.map(function(ch) {
          return ch.slug;
        });

        socket.emit('search text', {
          channels: chList,
          text: searchQuery
        });
      } else {
        searchBox.focus();
      }
    },

    render: function () {
      return (
        <form className="search" onSubmit={this.handleSearch}>
          <div className="form__row">
            <button type="submit" className="form__label">
              <i className="fa fa-search"></i>
            </button>

            <input className="form__text" type="text" id="search" ref="search" placeholder="Поиск" />
          </div>
        </form>
      );
    }
  });

  return SearchBlock;
};

module.exports = SearchComponent;
