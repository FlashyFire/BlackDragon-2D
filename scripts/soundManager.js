var soundManager = {
    clips: {},
    context: null,
    gainNode: null,
    loaded: false,
    init: function () {
        this.context = new AudioContext();
        this.gainNode = this.context.createGain?
        this.context.createGain(): this.context.createGainNode();
        this.gainNode.connect(this.context.destination);
    },
    load:function (path, callback) {
        if (this.clips[path]){
            callback(this.clips[path]);
            return;
        }
        var clip = {path: path, buffer: null, loaded: false};
        clip.play = function (volume, loop) {
            soundManager.play(this.path, {looping: loop?loop:false, volume: volume?volume:1});
        };
        this.clips[path] = clip;
        var request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            soundManager.context.decodeAudioData(request.response,
                function (buffer) {
                    clip.buffer = buffer;
                    clip.loaded = true;
                    callback(clip);
                });
        };
        request.send();
    },
    loadArray: function (array) {
        for (var i = 0; i < array.length; i++){
            soundManager.load(array[i], function () {
                if (array.length === Object.keys(soundManager.clips).length){
                    for (var sd in soundManager.clips)
                        if (!soundManager.clips[sd].loaded) return;
                    soundManager.loaded = true;
                }
            });
        }
    },
    play:function (path, settings) {
        if (!soundManager.loaded){
            setTimeout(function () {
                soundManager.play(path, settings);}, 1000);
            return;
        }
        var looping = false;
        var volume = 1;
        if (settings) {
            if (settings.looping)
                looping = settings.looping;
            if (settings.volume)
                volume = settings.volume;
        }
        var sd = this.clips[path];
        if (sd === null)
            return false;
        var sound = soundManager.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(soundManager.gainNode);
        sound.loop = looping;
        soundManager.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    },
    playWorldSound: function(path, x, y){
        if (gameManager.player === null)
            return;
        var viewSize = Math.max(mapManager.view.w, mapManager.view.h)*0.8;
        var dx = Math.abs(gameManager.player.pos_x - x);
        var dy = Math.abs(gameManager.player.pos_y - y);
        var distance = Math.sqrt(dx * dx + dy * dy);
        var norm = distance/viewSize;
        if (norm > 1)
            norm = 1;
        var volume = 1.0 - norm;
        if (!volume)
            return;
        soundManager.play(path, {looping: false, volume: volume});
    },
    toggleMute: function(){
        if (this.gainNode.gain.value > 0)
            this.gainNode.gain.value = 0;
        else
            this.gainNode.gain.value = 1;
    },
    stopAll: function(){
        this.gainNode.disconnect();
        this.gainNode = this.context.createGain?
            this.context.createGain(): this.context.createGainNode();
        this.gainNode.connect(this.context.destination);
    }
};