// this file manages the loading, managing  and playing of sounds

function Sound()
{
    // sound will keep all tracks in an array
    this.tracks = new Array();
    var maxTracks = 10;
    
    for(var i =0; i < maxTracks; i++)
    {
	this.tracks[i] = new Object();
	this.tracks[i]['channel'] = new Audio();
	this.tracks[i]['finished'] = -1;
    }
    
    if (typeof(_Sound_prototype_called) == 'undefined')
    {
	    _Sound_prototype_called = true;
	    Sound.prototype.play = play;
    }
    
    function play(sound)
    {
	if(document.getElementById(sound))
	{
	    for (var i=0 ; i < this.tracks.length; i++)
	    {
		thistime = new Date();
		if (this.tracks[i]['finished'] < thistime.getTime()) // is this channel finished?
		{			
			this.tracks[i]['finished'] = thistime.getTime() + document.getElementById(sound).duration*1000;
			this.tracks[i]['channel'].src = document.getElementById(sound).src;
			this.tracks[i]['channel'].load();
			this.tracks[i]['channel'].play();
			break;
		}
	    }
	}
    }
}