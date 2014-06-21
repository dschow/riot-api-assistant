var Page = {
    getUrl: function() {
        return $(location).attr('href');
    },
    getPath: function() {
        return $(location).attr('hostname') + $(location).attr('pathname');
    },
    isForum: function() {
        var parts = this.getPath().split('/');
        return (parts[parts.length-1] == 'riot-games-api');
    },
    isTopic: function() {
        return (this.getPath().indexOf("show") >= 0);
    },
    getTopicId: function() {
        if(this.isTopic()) {
            return $('#discussion-box').attr('data-apollo-discussion-id');
        }else{
            return 0;
        }
    },
    getCommentCount: function() {
        if(this.isTopic()) {
            //return $('.total-comment-count span.value').html();
            return $('.riot-comment:not(.deleted)').length;
        }else{
            return 0;
        }
    },
    highlightComments: function(id) {
        $('.riot-comment').each(function(index, element) {
            var date = DateUtil.riotTime($(this).find('div.riot-footer p em abbr').attr('title'));
            if(date > Storage.getCommentOld(Page.getTopicId())) {
                $(this).addClass('riot-comment-new');
            }
        });
    },
    watchHtml: function() {
        var discussionBox = $('#discussion-box').html();
        
        //Check for when discussion-box is populated
        var discussionBoxCheck = setInterval(function(){
            if($('#discussion-box').html() != discussionBox) {            
                //Update comment count
                Storage.updateVisit(Page.getTopicId(), Page.getCommentCount());
                
                //Count new posts
                $('.post').click(function() {
                    var text = $(this).parent().parent().parent().find('textarea').val();
                    if(text.length > 0 && text != 'Leave a comment') {
                        Page.watchHtml();
                    }
                });
                
                //Stop timer
                clearInterval(discussionBoxCheck);
            }
        }, 250);
    }
}

var DateUtil = {
    isDst: function(date) {
        var jan = new Date(new Date().getFullYear(), 0, 1);
        var jul = new Date(new Date().getFullYear(), 6, 1);
        var stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        return new Date(date).getTimezoneOffset() == stdTimezoneOffset;
    },
    riotTime: function(dateStr) {
        if(this.isDst(Date.parse(dateStr))) {
            return Date.parse(dateStr+' PDT');
        }else{
            return Date.parse(dateStr+' PST');
        }
    }
}

var Storage = {
    loaded: false, //Did data load from chrome.storage.local
    updateDuration: 5, //How long before new comments stop being highlighted (minutes)
    topicDuration: 7, //How long before topics are "forgotten" (days)
    data: {},
    init: function() {
        //Load data from chrome.storage.local
        chrome.storage.local.get('topics', function(items) {
            try {
                if(typeof items['topics'] !== 'undefined' && items['topics'].length > 0) {
                    Storage.data = jQuery.parseJSON(items['topics']);
                   
                    //Prune topics
                    Storage.pruneTopics();
                }
            }catch(e) {
                console.log('Topics failed to load');
            }
        });
        this.loaded = true;
    },
    updateStorage: function() {
        chrome.storage.local.set({'topics': JSON.stringify(Storage.data)});
    },
    updateVisit: function(id, count) {
        //Called whenever a user visits a topic
        if(this.loaded) {
            if(typeof this.data[id] === "undefined") {
                this.data[id] = {
                    'count': parseInt(count),
                    'lastCommentOld': 0,
                    'lastCommentNew': 0,
                    'lastUpdate': Date.now(),
                    'lastVisit': Date.now()
                }
            }else{
                this.data[id].count = parseInt(count);
                this.data[id].lastVisit = Date.now();
            }
            
            //Time for updateEntry?
            if(this.data[id].lastUpdate < (Date.now() - (this.updateDuration * 60 * 1000))) {
                this.updateTopic(id);
            }else{
                $('.riot-comment').each(function(index, element) {
                    var date = $(this).find('div.riot-footer p em abbr').attr('title');
                    //console.log(date);
                    Storage.updateComment(Page.getTopicId(), date); //Update lastCommentNew
                });
                
                if(this.getCommentOld(id) == 0) {
                    //If first time visiting topic, set lastCommentOld = lastCommentNew
                    this.data[id].lastCommentOld = this.data[id].lastCommentNew;
                }
            }
            
            //Highlight new comments
            Page.highlightComments(Page.getTopicId());
            
            this.updateStorage();
        }
    },
    updateTopic: function(id) {
        //Called whenever lastUpdate < (now - updateDuration)
        if(this.loaded) {
            this.data[id].lastUpdate = Date.now();
            this.data[id].lastCommentOld = this.data[id].lastCommentNew;
        }
    },
    updateComment: function(id, date) {
        //Called whenever lastUpdate > (now - updateDuration)
        if(this.loaded) {
            var commentDate = DateUtil.riotTime(date);
            if(commentDate > this.data[id].lastCommentNew) {
                this.data[id].lastCommentNew = commentDate;
            }
        }
    },
    getCommentCount: function(id) {
        //Returns the number of comments
        if(this.loaded && typeof this.data[id] != "undefined") {
            return this.data[id].count;
        }else{
            return -1;
        }
    },
    getCommentOld: function(id) {
        //Returns the time stamp of the latest comment
        if(this.loaded) {
            return this.data[id].lastCommentOld;
        }else{
            return 0;
        }
    },
    getCommentNew: function(id) {
        //Returns the time stamp of the latest comment
        if(this.loaded) {
            return this.data[id].lastCommentNew;
        }else{
            return 0;
        }
    },
    pruneTopics: function() {
        if(this.loaded) {
            if(Object.keys(this.data).length > 0) {
                $.each(this.data, function(index, value) {
                    var weekAgo = Date.now() - (Storage.topicDuration * 24 * 3600 * 1000);
                    if(value.lastVisit < weekAgo) {
                        Storage.deleteTopic(index);
                    }
                });
            }
        }
    },
    deleteTopic: function(id) {
        if(this.loaded) {
            delete this.data[id];
        }
    }
}
Storage.init();

console.log('Riot API Assistant Loaded.');

if(Storage.loaded) {
    //Data was successfully loaded from chrome.storage.local was successful
    if(Page.isForum()) {
        //Viewing forum
        $(window).load(function() {
            $('.discussion-list-item').each(function(index, element) {
                var commentsObj = $(this).find('a.total-comments-count');
                var comments = parseInt(commentsObj.html().split(' ')[0]);
                var storage = Storage.getCommentCount($(this).find('ul.voting').attr('data-discussion'));
                if(storage >= 0) {
                    var diff = comments - storage;
                    if(diff > 0) {
                        commentsObj.html(comments+' comments <span class="total-comments-new">('+diff+' new)</span>');
                    }
                }
            });
        });
    }else if(Page.isTopic()) {
        //Viewing a topic
        //console.log('isTopic');
        
        Page.watchHtml();
    }
}