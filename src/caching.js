'use strict';

var _ = require( 'lodash' );

// Pass in a function to return a caching version of that function
function caching( fn, isConstructor ){
	// An array of { input, output } references to store the result of each distinct function invocation
	var cache = [];

	if( arguments.length < 2 ){
		isConstructor = /function [A-Z]/.test( fn );
	}

	// This is the replacement interface for the function
	return function facade( input ){
		var isCached   = false;
		// Functions invoked with 'new' will never have the same context,
		// yet this is desirable for some singletons - but we need context
		// to correctly identify duplicate composite constructors. 
		// Isolate these cases by assigning them a void context.
		var context    = this instanceof facade ? void 0 : this;
		var signature  = [].concat.call( [ context ], arguments );
		var output     = _.findWhere( cache, function signaturesMatch( entry ){
			return ( isCached = _.every( signature, function argumentMatch( argument, index ){
				return signature[ index ] === entry.signature[ index ];
			} ) );
		} );
		var invocation = fn.bind.apply( fn, signature );

		// If we don't, execute the function and store the results
		if( !isCached ){
			if( isConstructor && !( this instanceof Object ) && !( this instanceof facade ) ){
				output = new invocation;
			}
			else {
				output = invocation();
			}

			cache.push( { signature : signature, output : output } );
		}

		return output;
	};
}
