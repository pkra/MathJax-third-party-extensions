/* -*- Mode: Javascript; indent-tabs-mode:nil; js-indent-level: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */

/*************************************************************
 *
 *  MathJax/extensions/TeX/siunitx.js
 *  
 *  Implements some of the features provided by the siunitx LaTeX package.
 *  
 *  ---------------------------------------------------------------------
 *  
 *  Copyright (c) 2011-2014 The MathJax Consortium
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

MathJax.Extension["TeX/siunitx"] = {
  version: "0.1.0"
};

MathJax.Hub.Register.StartupHook("TeX Jax Ready", function () {
  
  var TEX = MathJax.InputJax.TeX;
  var TEXDEF = TEX.Definitions;
  var MML = MathJax.ElementJax.mml;

  var UNITSMACROS = {
    // aliases
    meter: ['Macro','\\metre'],
    
    // abbreviations
    kg: ['Macro','\\kilogram'],
    amu: ['Macro','\\atomicmassunit'],
    kWh: ['Macro','\\kilo\\watt\\hour']
  };

  // ******* SI prefixes *******************
    
  var SIPrefixes = (function (def){
    var ret = {};
    for(var pfx in def){
      var data = def[pfx];
      ret[pfx] = {
		name: pfx,
		power: data[0],
		abbrev: data[1],
        pfx: data.length>=3 ? data[2] : data[1]
	  };
    };
    return ret;
  })({
    yocto: [-24,'y'],
	zepto: [-21,'z'],
    atto:  [-18,'a'],
    femto: [-15,'f'],
    pico:  [-12,'p'],
    nano:  [ -9,'n'],
    micro: [ -6,'u', MML.entity("#x03bc")],
    milli: [ -3,'m'],
    centi: [ -2,'c'],
    deci:  [ -1,'d'],

    deca:  [  1,'da'],
    hecto: [  2,'h'],
    kilo:  [  3,'k'],
    mega:  [  6,'M'],
    giga:  [  9,'G'],
    tera:  [ 12,'T'],
    peta:  [ 15,'P'],
    exa:   [ 18,'E'],
    zetta: [ 21,'Z'],
    yotta: [ 24,'Y']
  });
  MathJax.Extension["TeX/siunitx"].SIPrefixes = SIPrefixes;

  for(var pfx in SIPrefixes){
    pfx = SIPrefixes[pfx];
    UNITSMACROS[pfx.name] = ['SIPrefix',pfx];
  }

  // ******* SI units *******************
    
  function _BuildUnits(category,defs){
    var units = [];
    for(var unit in defs){
      var def = defs[unit];
      units.push({
          name: unit,
          category: category,
          symbol: def[0],
          abbrev: def[1]
      });
    }
    return units;
  }
    
  var SIUnits = (function (arr){
    ret = {};
    arr.forEach(function (unit){
      ret[unit.name] = unit;
    });
    return ret;
  })([].concat(_BuildUnits('SI base',{
    ampere:   ['A','A'],
    candela:  ['cd'],
    kelvin:   ['K','K'],
    kilogram: ['kg','kg'],
    metre:    ['m','m'],
    mole:     ['mol','mol'],
    second:   ['s','s']
  }),_BuildUnits('coherent derived',{
    bequerel: ['Bq'],
    degreeCelsius: [MML.entity("#x2103")],
    coulomb: ['C'],
    farad: ['F','F'],
    gray: ['Gy'],
    hertz: ['Hz','Hz'],
    henry: ['H'],
    joule: ['J','J'],
    katal: ['kat'],
    lumen: ['lm'],
    lux: ['lx'],
    newton: ['N','N'],
    ohm: [MML.entity("#x03a9"),'ohm'],
    pascal: ['pa','Pa'],
    radian: ['rad'],
    siemens: ['S'],
    sievert: ['Sv'],
    steradian: ['sr'],
    tesla: ['T'],
    volt: ['V','V'],
    watt: ['W','W'],
    weber: ['Wb'],
  }),_BuildUnits('accepted non-SI',{
    day: ['d'],
    degree: [MML.entity("#x00b0")],
    hectare: ['ha'],
    hour: ['h'],
    litre: ['l','l'],
    liter: ['L','L'],
    arcminute: [MML.entity("#x2032")], // plane angle;
    minute: ['min'],
    arcsecond: [MML.entity("#x2033")], // plane angle;
    tonne: ['t'],
  }),_BuildUnits('experimental non-SI',{
    astronomicalunit: ['ua'],
    atomicmassunit: ['u'],
    bohr: ['a_0'],
    clight: ['c_0'],
    dalton: ['Da'],
    electronmass: ['m_e'],
    electronvolt: ['eV','eV'],
    elementarycharge: ['e'],
    hartree: ['E_h'],
    planckbar: ['\\hbar '],
  }),_BuildUnits('other non-SI',{
    angstrom: [MML.entity("#x212b")],
    bar: ['bar'],
    barn: ['b'],
    bel: ['B'],
    decibel: ['dB','dB'],
    knot: ['kn'],
    mmHg: ['mmHg'],
    nauticmile: [';'],
    neper: ['Np'],
  })));
  MathJax.Extension["TeX/siunitx"].SIUnits = SIUnits;
    
  for(var unit in SIUnits){
    unit = SIUnits[unit];
    UNITSMACROS[unit.name] = ['SIUnit',unit];
  }

  // ******* unit abbreviations *******************
      
  /*
   * I'm too lazy to write all of the abbreviations by hand now, so here it is
   * programmatically.
   */
  var AbbrevPfx = {};
  for(var pfx in SIPrefixes){
    pfx = SIPrefixes[pfx];
    if(pfx.abbrev){
      AbbrevPfx[pfx.abbrev] = pfx.name;
    }
  }
  var AbbrevUnits = {};
  for(var unit in SIUnits){
    unit = SIUnits[unit];
    if(unit.abbrev){
      AbbrevUnits[unit.abbrev] = unit.name;
    }
  }

  function _ParseAbbrev(abbrev) {
    var unit = AbbrevUnits[abbrev];
    var repl = '';
    if( unit === undefined ){
      unit = AbbrevUnits[abbrev.slice(1)];
      if( unit === undefined ){
        // should never happen!
        console.log('cannot parse abbreviation',abbrev);
        return
      }
      repl = AbbrevPfx[abbrev[0]];
      if( repl === undefined ){
        // should never happen!
        console.log('cannot parse prefix ',abbrev[0],' on unit ',unit,' (',abbrev,')');
        return
      }
      repl = '\\' + repl
    }
    repl += '\\' + unit
    return repl;
  }
   
  // install a number of abbrevs as macros, the same as siunitx does.
  [
    "fg pg ng ug mg g",
    "pm nm um mm cm dm m km",
    "as fs ps ns us ms s",
    "fmol pmol nmol umol mmol mol kmol",
    "pA nA uA mA A kA",
    "ul ml l hl uL mL L hL",
    "mHz Hz kHz MHz GHz THz",
    "mN N kN MN",
    "Pa kPa MPa GPa",
    "mohm kohm Mohm",
    "pV nV uV mV V kV",
    "uW mW W kW MW GW",
    "J kJ",
    "meV eV keV MeV GeV TeV",
    "fF pF F",
    "K",
    "dB"    
  ].forEach(function(abbrset){abbrset.split(' ').forEach(function (abbrev){
      UNITSMACROS[abbrev] = ['Macro',_ParseAbbrev(abbrev)];
  })});
  
  /*
   * This is the TeX parser for unit fields
   */
  var SIUnitParser = TEX.Parse.Subclass({
    Init: function (string,env) {
      this.cur_prefix = undefined;
	  this.has_literal = false; // Set to true if non-siunitx LaTeX is encountered in input
	  this.units = [];
      arguments.callee.SUPER.Init.call(this,string,env);
	  if(this.has_literal){
		console.log('Unit "',string,'" was parsed literally ',this.units);
	  } else {
		console.log('Unit "',string,'" was parsed as these units: ',this.units);
	  }
    },

	// This is used to identify non-siunitx LaTeX in the input
    Push: function () { this.has_literal=true; this.stack.Push.apply(this.stack,arguments);},
	// While literal fall-back output from proper unit macros use this path
	PushUnitFallBack: function() {this.stack.Push.apply(this.stack,arguments);},
	
    csFindMacro: function (name) {
      var macro = UNITSMACROS[name];
      if( macro ) return macro;
      
      return arguments.callee.SUPER.csFindMacro.call(this,name);
    },
    
    SIPrefix: function (name, pfx) {
      console.log('SIPrefix ',name,pfx);
      if(this.cur_prefix){
        TEX.Error(["SIunitx","double SI prefix",this.cur_prefix,pfx]);
      }
      this.cur_prefix = pfx;
    },
    
    SIUnit: function (name, unit) {
      console.log('SIUnit ',name,unit,this.cur_prefix);

	  // Add to units
	  this.units.push({
		unit: unit,
		prefix: this.cur_prefix
	  });
	
	  // And process fall-back
      var parts = [];
      if(this.cur_prefix)
        parts = parts.concat(this.cur_prefix.pfx);
      parts = parts.concat(unit.symbol);
      var curstring = '';
      var content = [];
      parts.forEach(function (p){
        if(typeof p == 'string' || p instanceof String){
          curstring += p;
        } else {
          if(curstring){
            content.push(MML.chars(curstring));
            curstring = '';
          }
          content.push(p);
        }
      });
      if(curstring)
        content.push(MML.chars(curstring));
      console.log('parts   is ',parts);
      console.log('content is ',content);
      var def = {mathvariant: MML.VARIANT.NORMAL};
      this.PushUnitFallBack(this.mmlToken(MML.mi.apply(MML.mi,content).With(def)));
        
      this.cur_prefix = undefined;
    }
  });
  MathJax.Extension["TeX/siunitx"].SIUnitParser = SIUnitParser;
  
  /*
   * This is essentially a namespace for the various functions needed,
   * such that TEX.Parse's namespace is not cluttered too much.
   */
  var SIunitx = MathJax.Object.Subclass({
    macro: "",    // the macro being used
    args: "",     // the macro arguments
    
    //
    // Just store the name and arguments
    //
    Init: function (macro, args) {
      this.macro = macro.slice(1);
      this.args = args;
    },

    //
    // Main entry point to the SIunitx namespace.
    // Calls the appropriate macro handler
    //  
    Parse: function (parser) {
      var macro = this['Parse_'+this.macro];
      macro.apply(this,[parser].concat(this.args));
      console.log('result of parsing ',this.macro,this.args,'is',parser.stack.toString())
    },
    
    Parse_si: function (parser,units) {
      parser.Push(this.ParseUnits(parser,units));
    },


    Parse_SI: function (parser,num,units) {
      parser.Push(this.ParseNumber(parser,num));
      parser.Push(MML.mspace().With({width: MML.LENGTH.MEDIUMMATHSPACE, mathsize: MML.SIZE.NORMAL, scriptlevel:0}));
      parser.Push(this.ParseUnits(parser,units));
    },
    
    //
    ParseNumber: function (parser,expr) {
      return TEX.Parse(expr,parser.stack.env).mml();
    },
    
    ParseUnits: function (parser,expr) {
      var mml = SIUnitParser(expr,parser.stack.env).mml();
      return mml;
    }
    
  });
  MathJax.Extension["TeX/siunitx"].SIunitx = SIunitx;
  
  
  /***************************************************************************/

  TEX.Definitions.Add({
    macros: {
      //
      //  Set up the macros for SI units
      //
      SI:   ['SIunitx',2],
      si:   ['SIunitx',1]
    }
  },null,true);
    
  TEX.Parse.Augment({

    //
    //  Implements \SI and friends
    //
    SIunitx: function (name, nargs) {
      var args = []
      for(;nargs>0;nargs--)
        args.push(this.GetArgument(name));
      console.log(' got SIunitx ',name,args,nargs);
      var SI = SIunitx(name,args);
      SI.Parse(this);
    }
    
  });
  
  //
  //  Indicate that the extension is ready
  //
  MathJax.Hub.Startup.signal.Post("TeX siunitx Ready");

});

MathJax.Ajax.loadComplete("[MathJax]/extensions/TeX/siunitx.js");
