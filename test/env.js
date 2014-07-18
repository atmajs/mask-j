console.log('env');
include
	.js('/.import/mask.js')
	.load('/lib/jmask.embed.js::Source')
	.done(function(resp){
		
		mask.plugin(resp.load.Source);
		jmask = mask.jmask;
	});