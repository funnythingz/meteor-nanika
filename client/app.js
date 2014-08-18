var createTimeOptions = function() {

  var _timeOptions = [];

  for (var i = 0; i < 24; i++) {

    if (_.isEqual(i.toString().length, 2)) {
      _timeOptions.push(i + ":00");
      _timeOptions.push(i + ":30");
    } else {
      _timeOptions.push("0" + i + ":00");
      _timeOptions.push("0" + i + ":30");
    }
  }

  return _timeOptions;

}

Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});

Router.map(function() {

  this.route('home', {
    path: '/',
    template: 'home'
  });

  this.route('about', {
    path: '/about',
    template: 'about'
  });

  this.route('new', {
    path: '/new',
    template: 'new',
    data: function() {
      return createTimeOptions();
    }
  });

  this.route('admin', {
    path: '/admin',
    template: 'admin',
    data: function() {
      var _result = BoonsCollection.find({}, {sort: {created_at: -1}});
      return _result;
    }
  });

  this.route('show', {
    path: '/boons/:_id',
    template: 'show',
    onBeforeAction: function() {
      if(_.isUndefined(BoonsCollection.findOne(this.params._id))) {
        Router.go('home');
      }
    },
    data: function() {

      var hasDetailInfo = function(_result) {
        return (! _.isEmpty(_result.eventTime) && ! _.isEmpty(_result.eventInfo));
      }

      var _resultBoon = BoonsCollection.findOne(this.params._id);

      var showViewModel = {
        thisUrl: location.href,
        result: _resultBoon,
        hasDetailInfo: hasDetailInfo(_resultBoon)
      }

      return showViewModel;
    }
  });

});

Template.show.events({

  'click #delete': function() {
    BoonsCollection.remove($('#delete').data('id'));
    Router.go('list');
  },

  'click #copyTargetUrl': function() {
    $('#copyTargetUrl').select();
  }

});

var RequiredChecker = function() {

  this.required = false;

  this.isRequired = function() {
    return this.required;
  }

  this.ok = function() {
    this.required = true;
  }

  this.ng = function() {
    this.required = false;
  }

  this.check = function(str) {

    if(_.isEmpty(str)) {
      this.ng();
      return this.required;
    }

    if(/^\s+$/.test(str)) {
      this.ng();
      return this.required;
    }

    this.ok();
    return this.required;

  }
}

var inputTitleRequiredChecker = new RequiredChecker();
var selectDateRequiredChecker = new RequiredChecker();

Template.new.events({

  'click #postEntry' : function(e) {

    var $inputEventTitle = $('#inputEventTitle');
    var $inputEventTime = $('#inputEventTime');
    var $infoArea = $('#infoArea');
    var $inputPassword = $('#inputPassword');

    var $selectDate = $('#select-date');
    var $selectStartTime = $('#select-start-time');
    var $selectEndTime = $('#select-end-time');

    if(inputTitleRequiredChecker.check($inputEventTitle.val())) {
      $('#inputEventTitleIsRequired').addClass('hide');
      inputTitleRequiredChecker.ok();
    } else {
      $('#inputEventTitleIsRequired').removeClass('hide');
      inputTitleRequiredChecker.ng();
    }

    if(selectDateRequiredChecker.check($selectDate.val())) {
      $('#selectDateIsRequired').addClass('hide');
      selectDateRequiredChecker.ok();
    } else {
      $('#selectDateIsRequired').removeClass('hide');
      selectDateRequiredChecker.ng();
    }

    if(inputTitleRequiredChecker.isRequired() && selectDateRequiredChecker.isRequired()) {

      var _id = BoonsCollection.insert({
        eventTitle: $inputEventTitle.val(),
        eventTime: $inputEventTime.val(),
        eventInfo: $infoArea.val(),
        selectDate: $selectDate.val(),
        selectStartTime: $selectStartTime.val(),
        selectEndTime: $selectEndTime.val(),
        createAt: (new Date()).getTime()
      });

      location.href = '/boons/' + _id;

    }

  }
});
