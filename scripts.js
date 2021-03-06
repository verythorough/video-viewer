var VideoModel = Backbone.Model.extend({
  defaults: {
    title: 'Untitled',
    channel: 'Unknown'
  },
  parse: function(data) {
    data.videoId = data.id.videoId;
    delete data.id;
    data.title = data.snippet.title;
    data.channel = data.snippet.channelTitle;
    data.thumbURL = data.snippet.thumbnails.medium.url;
    delete data.snippet;
    return data;
  },
  initialize: function() {
    this.set('linkURL', 'https://www.youtube.com/watch?v=' + this.get('videoId'));
    this.set('embedURL', 'https://www.youtube.com/embed/' + this.get('videoId') + '?autoplay=1');
  }
});

var VideoCollection = Backbone.Collection.extend({
  model: VideoModel
});

var VideoItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'video-item',
  render: function() {
    var template = Handlebars.compile($( '#video-item-template' ).html());
    var rendered = template( this.model.attributes );
    this.$el.html(rendered);
    return this;
  },
  events: {
    'click a' : 'playVideo',
  },
  playVideo: function(e) {
    e.preventDefault();
    var playerView = new VideoPlayerView({model: this.model});
    $('#video-player').html(playerView.render().$el);
    $('.curtain').addClass('open');
    $('#video-player').fadeIn(2000);
  }
});

var VideoPlayerView = Backbone.View.extend({
  tagName: 'div',
  className: 'player-frame',
  render: function() {
    var template = Handlebars.compile($("#player-template").html());
    var rendered = template(this.model.attributes);
    this.$el.html(rendered);
    return this;
  }
});

var VideoListView = Backbone.View.extend({
  tagName: 'ul',
  className: 'video-list',
  render: function() {
    this.collection.each(function( item ) {
      this.renderVideo( item );
    }, this );
  },
  renderVideo: function( item ) {
    var videoItemView = new VideoItemView({
      model: item
    });
    this.$el.append( videoItemView.render().el );
  }
});

var topics = ['shiba', 'red panda', 'sea otter', 'river otter', 'mugumogu', 'corgi', 'sleepy kitten', 'baby elephant'],
    topic = topics[Math.floor((Math.random() * topics.length))],
    $topicInput = $('#topic-input');

function loadList(topic) {
	$.ajax({type: "GET",
    url: "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&safeSearch=moderate&type=video&videoEmbeddable=true&fields=items(id%2Csnippet)&key=AIzaSyCRXTR0G_Slvgyjj_Vgfry6KLiw8pIMlHs&q=" + topic,
    dataType: "json",
    success: function(videosJSON) {
      if (videosJSON.items.length < 1) {
        alert('No videos found! Try a different search.');
        $topicInput.val('').focus();
      } else {
        var videos = new VideoCollection(videosJSON.items, {parse:true});
        var vidlist = new VideoListView({collection: videos});
        //Can't delete this line - debug later
        console.log(vidlist.render());
        $('#video-chooser').html(vidlist.$el);
      }
    },
    error: function(xhr, status, e) {
      console.log(status, e);
    }
  });
}

var timeoutID;

function delayedEmpty() {
  timeoutID = window.setTimeout(slowEmpty, 2000);
}

function slowEmpty() {
  $('#video-player').empty();
}

$(document).ready(function() {
  $topicInput.val(topic);
  loadList(topic);
  $topicInput.keyup(function (e) {
  if (e.which == 13) {
    var newQuery = encodeURIComponent($topicInput.val());
    loadList(newQuery);
    $topicInput.blur();
    $('.curtain').removeClass('open');
    $('#video-player').fadeOut(2000);
    delayedEmpty();
  }
  });
});