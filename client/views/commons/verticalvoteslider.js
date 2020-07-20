Template.verticalvoteslider.rendered = function() {
    var voteType = this.data.voteType
    var sliderclass = this.data.sliderclass
    var slider = document.getElementById("voterange" + voteType + sliderclass);
    var bubble = document.getElementById("sliderBubble" + voteType + sliderclass)
    var holder = document.getElementById("vsliderholder" + voteType + sliderclass)
    var bubbleholder = document.getElementById("bubblevsliderholder" + voteType + sliderclass)

    var value = document.getElementById("votevt" + voteType + sliderclass);
    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
    var vt = parseFloat(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).vt.v / 100 * UserSettings.get('voteWeight')).toFixed(2)
    value.innerHTML = cuteNumber(vt)
    slider.value = UserSettings.get('voteWeight')
    var resizePopup = function() { $('.ui.popup').css('max-height', $(window).height()); };

    $(window).resize(function(e) {
        resizePopup();
    });

    function setBubble() {
        const
            newValue = Number((slider.value - slider.min) * 100 / (slider.max - slider.min)),
            newPosition = (newValue * 0.88);
        if (voteType === 'up')
            bubble.innerHTML = `<span>${slider.value}%</span>`;
        else bubble.innerHTML = `<span>-${slider.value}%</span>`;
        bubble.style.bottom = `calc(${newPosition}% + 26px)`;
        bubble.style.left = `9px`;
        var vt = parseFloat(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).vt.v / 100 * slider.value).toFixed(2)
        value.innerHTML = cuteNumber(vt)
        holder.style.height = `calc(${newPosition}% + 15px)`;
        bubbleholder.style.bottom = `calc(${newPosition}% + 5px)`;
    }

    function cuteNumber(num, digits) {
        if (num > 1) num = Math.round(num)
        if (typeof digits === 'undefined') digits = 2
        var units = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
        var decimal
        var newNum = num
        for (var i = units.length - 1; i >= 0; i--) {
            decimal = Math.pow(1000, i + 1)
            if (num <= -decimal || num >= decimal) {
                newNum = +(num / decimal).toFixed(digits) + units[i]
                break
            }
        }
        var limit = (newNum < 0 ? 5 : 4)
        if (newNum.toString().length > limit && digits > 0)
            return cuteNumber(num, digits - 1)
        return newNum;
    }

    $(`.${voteType}.button.voteslider.${sliderclass}`)
        .popup({
            popup: $(`.${voteType}vote.popup.${sliderclass}`),
            on: 'click',
            lastResort: 'bottom right',
            position: 'top center',
            onShow: function() {
                resizePopup();
                $('body').first().addClass('lock-vscroll')
                $('.ui.videocontainer').bind(mousewheelevt, moveSlider);
            },
            onHide: function() {
                $('body').first().removeClass('lock-vscroll')
                $('.ui.videocontainer').unbind(mousewheelevt, moveSlider);
            },
        })

    function moveSlider(e) {
        var zoomLevel = parseFloat(slider.value).toFixed(1);
        if (e.originalEvent.wheelDelta < 0 || e.detail > 0) {
            //scroll down
            slider.value = Number(zoomLevel) - 1;
        } else {
            //scroll up
            slider.value = Number(zoomLevel) + 1;
        }
        var vt = parseFloat(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).vt.v / 100 * slider.value).toFixed(2)
        value.innerHTML = cuteNumber(vt)
        setBubble()
        return false;
    }
    slider.oninput = function() {
        var vt = parseFloat(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).vt.v / 100 * this.value).toFixed(2)
        value.innerHTML = cuteNumber(vt)
        setBubble()
    }
    setBubble()
}

Template.verticalvoteslider.events({

    'click .addtag': function(event) {
        $('.tagvote').removeClass('dsp-non');
        $('.simplevote').addClass('dsp-non');
    },
    'click .removetag': function(event) {
        $('.simplevote').removeClass('dsp-non');
        $('.tagvote').addClass('dsp-non');
    },

    'click .button.upvote': function(event) {
        let author = FlowRouter.getParam("author")
        let permlink = FlowRouter.getParam("permlink")
        let weight = document.getElementById("voterangeup").value * 100
        let weightSteem = UserSettings.get('voteWeightSteem') * 100
        let weightHive = UserSettings.get('voteWeightHive') * 100
        let refs = Session.get('currentRefs')
        $('.ui.popup').popup('hide all');
        $('.ui.up.votesliderloader').removeClass('dsp-non');
        $('.ui.votebutton.voteslider.up').addClass('dsp-non');
        broadcast.multi.vote(refs, weight, weightSteem, weightHive, '', function(err, result) {
            if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
            else {
                toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
                    // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
                    // audio.play();
            }
            $('.ui.up.votesliderloader').addClass('dsp-non');
            $('.ui.votebutton.voteslider.up').removeClass('dsp-non');
            Template.video.loadState()
        });
    },
    'click .button.downvote': function(event) {
        let author = FlowRouter.getParam("author")
        let permlink = FlowRouter.getParam("permlink")
        let weight = document.getElementById("voterangedown").value * -100
        let weightSteem = UserSettings.get('voteWeightSteem') * -100
        let weightHive = UserSettings.get('voteWeightHive') * -100
        let refs = Session.get('currentRefs')
        $('.ui.popup').popup('hide all');
        $('.ui.down.votesliderloader').removeClass('dsp-non');
        $('.ui.votebutton.voteslider.down').addClass('dsp-non');
        broadcast.multi.vote(refs, weight, weightSteem, weightHive, '', function(err, result) {
            if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
            else {
                toastr.success(translate('GLOBAL_ERROR_DOWNVOTE_FOR', weight / 100 + '%', author + '/' + permlink))
                    // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
                    // audio.play();
            }
            $('.ui.down.votesliderloader').addClass('dsp-non');
            $('.ui.votebutton.voteslider.down').removeClass('dsp-non');
            Template.video.loadState()
        });
    },

    'click .button.upvotetag': function(event) {
        var newTag = $('.tagvote.up .tagvalue').val()
        if (!newTag) return
        let author = FlowRouter.getParam("author")
        let permlink = FlowRouter.getParam("permlink")
        let weight = document.getElementById("voterangeup").value * 100
        let weightSteem = UserSettings.get('voteWeightSteem') * 100
        let weightHive = UserSettings.get('voteWeightHive') * 100
        let refs = Session.get('currentRefs')
        $('.ui.popup').popup('hide all');
        $('.ui.up.votesliderloader').removeClass('dsp-non');
        $('.ui.votebutton.voteslider.up').addClass('dsp-non');
        broadcast.multi.vote(refs, weight, weightSteem, weightHive, newTag, function(err, result) {
            if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
            else {
                toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
                    // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
                    // audio.play();
            }
            $('.ui.up.votesliderloader').addClass('dsp-non');
            $('.ui.votebutton.voteslider.up').removeClass('dsp-non');
            Template.video.loadState()
        });
    },
    'click .button.downvotetag': function(event) {
        var newTag = $('.tagvote.down .tagvalue').val()
        if (!newTag) return
        let author = FlowRouter.getParam("author")
        let permlink = FlowRouter.getParam("permlink")
        let weight = document.getElementById("voterangedown").value * -100
        let weightSteem = UserSettings.get('voteWeightSteem') * -100
        let weightHive = UserSettings.get('voteWeightHive') * -100
        let refs = Session.get('currentRefs')
        $('.ui.popup').popup('hide all');
        $('.ui.down.votesliderloader').removeClass('dsp-non');
        $('.ui.votebutton.voteslider.down').addClass('dsp-non');
        broadcast.multi.vote(refs, weight, weightSteem, weightHive, newTag, function(err, result) {
            if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
            else {
                toastr.success(translate('GLOBAL_ERROR_DOWNVOTE_FOR', weight / 100 + '%', author + '/' + permlink))
                    // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
                    // audio.play();
            }
            $('.ui.down.votesliderloader').addClass('dsp-non');
            $('.ui.votebutton.voteslider.down').removeClass('dsp-non');
            Template.video.loadState()
        });
    },
})

Template.verticalvoteslider.helpers({
    mainUser: function() {
        return Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' })
    },
    convertTag: function(tag) {
        var tagWithoutDtube = tag.replace("dtube-", "")
        return tagWithoutDtube
    },
    firstTag: function(alltags) {
        if (alltags)
            return alltags[0]
        else return false
    },
    hasVoted: function(one, two) {
        if (one || two) return true;
        return false;
    }
});