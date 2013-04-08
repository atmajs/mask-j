global.mask = require('../.import/mask.node.js');

var buster = require('buster'),
	$ = require('../lib/jmask.js');


buster.testCase('Single ', {
	'lib': function(){
		assert(typeof $ === 'function', 'Compo.jmask is not a function');
	},
	'div (attr)': function() {
		var div = $('div');

		assert(div.length === 1, 'shoud contain one item');

		// attr
		div.attr('key', 'xvalue');
		assert(div.attr('key') === 'xvalue', 'shoud have key="xvalue" attr');

		div.removeAttr('key');
		assert(div.attr('key') == null, 'shoud have no key attr');

		div.prop('key', 'xvalue');
		assert(div.prop('key') === 'xvalue', 'shoud have key="xvalue" prop');

		div.removeProp('key');
		assert(div.prop('key') == null, 'shoud have no key prop');

		// class
		div.addClass('myclass');
		assert(div.attr('class') === 'myclass', 'shoud have class="myclass" attr');
		assert(div.hasClass('myclass'), 'shoud have myclass class');

		div.addClass('other');
		assert(div.attr('class') === 'myclass other', 'shoud have class="myclass other" attr');
		assert(div.hasClass('myclass'), 'shoud have myclass class');
		assert(div.hasClass('other'), 'shoud have other class');

		div.removeClass('myclass');
		assert(div.attr('class') === 'other', 'shoud have class="myclass other" attr');
		assert(div.hasClass('myclass') == false, 'shouldnt have myclass class');
		assert(div.hasClass('other'), 'shoud have other class');

		div.toggleClass('myclass');
		assert(div.attr('class') === 'other myclass', 'shoud have class="other myclass" attr');
		assert(div.hasClass('myclass'), 'shoud have myclass class');
		assert(div.hasClass('other'), 'shoud have other class');

		div.removeClass('other');
		assert(div.attr('class') === 'myclass', 'shoud have class="other myclass" attr');
		assert(div.hasClass('myclass'), 'shoud have myclass class');

		assert(div.hasClass('other') == false, 'shouldnt have other class');

		// css
		div.css('width', '10px');

		assert(div.attr('style') === 'width:10px', 'should have style="width:10px" attr');
		assert(div.css('width') === '10px', 'should have 10px for width');

		div.css({
			height: '20px',
			color: '#fff'
		});
		assert(div.css('color') === '#fff', 'should have #fff for color');
		assert(div.css('width') === '10px', 'should have 10px for width');

		div.attr('style', 'font-weight:bold;');
		assert(div.css('width') == null, 'shouldnt have 10px for width');
		assert(div.css('font-weight') === 'bold', 'should have bold for font-weight');
	},
	'div (manip clone/append/remove/attr/class)': function() {
		var div = $('div style="font-weight:bold"');

		assert(div.clone().css('font-weight') === 'bold', 'cloned shoud have font-weight as bold');

		div.append('span');
		assert(div.children().length === 1, 'div should have 1 child');

		div.append('table');

		assert(div.children().length === 2, 'div should have 2 childs');
		assert(div.children('span').length === 1, 'div should have 1 span child');
		assert(div.find('span').length === 1, 'div should have 1 span child');

		div.children('span').attr('id', 'spanny');
		assert(div.find('#spanny').length === 1, 'div should have 1 child with id spanny');

		div.children('table').append('button');
		assert(div.find('span').children().length === 0, 'span should have no children');
		assert(div.find('table').children().length === 1, 'table shoud have one child');


		div.children().addClass('classy');
		assert(div.children().eq(0).hasClass('classy'), 'Span shoud have class classy');
		assert(div.children().eq(1).hasClass('classy'), 'Table shoud have class classy');

		div.children('table').remove();
		assert(div.children().length === 1, 'Shoud contain 1 child after .remove call');


		assert(div.prepend('ul > li > "hello"').children().eq(0).get(0).tagName === 'ul', 'First child shoud be UL');


		assert(div.empty().children().length === 0, 'Shoud have no childs after .empty');
	},

	'div (stringify)': function(){
		var div = $('div style="color:#fff" > span > ul > li > "Name";'),
			str = div.mask();

		var div2 = $(str);

		assert.equals(str, div2.mask(), 'Two markups should be equal');

	},
	'divs (manip)': function(){
		var div = $('div;div;');

		assert.equals($('div {div; div;}').mask(), div.wrapAll('div').mask(), 'wrappAll failed');

		assert.equals($('div > div; div > div;').mask(), div.wrap('div').mask(), 'wrap failed');
	}
});
