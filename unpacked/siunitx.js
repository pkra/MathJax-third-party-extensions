/* -*- Mode: Javascript; indent-tabs-mode:nil; js-indent-level: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */

/*************************************************************
 *
 *  MathJax/extensions/TeX/mhchem.js
 *  
 *  Implements the \ce command for handling chemical formulas
 *  from the mhchem LaTeX package.
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

MathJax.Hub.Register.StartupHook("TeX Jax Ready",function () {
  
  var TEX = MathJax.InputJax.TeX;
  
  var UNITSMACROS = {
    // SI base units
    ampere:   ['SIUnit', 'A'],
    candela:  ['SIUnit', 'cd'],
    kelvin:   ['SIUnit', 'K'],
    kilogram: ['SIUnit', 'kg'],
    metre:    ['SIUnit', 'm'],
    mole:     ['SIUnit', 'mol'],
    second:   ['SIUnit', 's'],
   
    // SI prefixes
    yocto: ['SIPrefix',-24],
    zepto: ['SIPrefix',-21],
    atto:  ['SIPrefix',-18],
    femto: ['SIPrefix',-15],
    pico:  ['SIPrefix',-12],
    nano:  ['SIPrefix',-9],
    micro: ['SIPrefix',-6],
    milli: ['SIPrefix',-3],
    centi: ['SIPrefix',-2],
    deci:  ['SIPrefix',-1],

    deca:  ['SIPrefix',1],
    hecto: ['SIPrefix',2],
    kilo:  ['SIPrefix',3],
    mega:  ['SIPrefix',6],
    giga:  ['SIPrefix',9],
    tera:  ['SIPrefix',12],
    peta:  ['SIPrefix',15],
    exa:   ['SIPrefix',18],
    zetta: ['SIPrefix',21],
    yotta: ['SIPrefix',24],
    
    // aliases
    meter: ['Macro','\\metre'],
    
    // abbreviations
    kg: ['Macro','\\kilogram']
    // atomic mass units 'amu' is missing!
  };
  
  /* Add abbreviations */
  var AbbrevPfx = {
    a: 'atto',
    f: 'femto',
    p: 'pico',
    n: 'nano',
    u: 'micro',
    m: 'milli',
    c: 'centi',
    d: 'deci',
    
    h: 'hecto',
    k: 'kilo',
    M: 'mega',
    G: 'giga',
    T: 'tera'
  };
  var AbbrevUnits = {
    g: 'gram',
    m: 'metre',
    s: 'second',
    mol: 'mole',
    A: 'ampere',
    l: 'litre',
    L: 'liter',
    Hz: 'hertz',
    N: 'newton',
    Pa: 'pascal',
    ohm: 'ohm',
    V: 'volt'
  };
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
    "pV nV uV mV V"
  ].forEach(function(abbrset){abbrset.split(' ').forEach(function (abbrev){
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
//    console.log('replacing ',abbrev,' by ',repl);
    UNITSMACROS[abbrev] = ['Macro',repl];
  })});
  
  
  /*
   * This is the TeX parser for unit fields
   */
  var SIUnitParser = TEX.Parse.Subclass({
    Init: function (string,env) {
      this.cur_prefix_power = 0;
      arguments.callee.SUPER.Init.call(this,'\\mathrm '+string,env);
    },

    csFindMacro: function (name) {
      var macro = UNITSMACROS[name];
      if( macro ) return macro;
      
      return arguments.callee.SUPER.csFindMacro.call(this,name);
    },
    
    SIPrefix: function (name, power) {
      if(this.cur_prefix_power){
        TEX.Error(["SIunitx","double SI prefix",this.cur_prefix_power,power]);
      }
      this.cur_prefix_power = power;
    },
    
    SIUnit: function (name, symbol) {
      this.string = '{'+symbol+'}' + this.string.slice(this.i);
      this.i = 0;
      this.cur_prefix_power = 0;
    }
  });
  
  /*
   *  This is the main class for handing the \si and related commands.
   *  Its main method is Parse() which takes the arguments to \si and
   *  returns the corresponding TeX string.
   */
  var SIunitx = MathJax.Object.Subclass({
    macro: "",    // the macro being used
    args: "",     // the macro arguments
    
    //
    //  Store the string when a CE object is created
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
      return macro.apply(this,[parser].concat(this.args));
    },
    
    Parse_si: function (parser,units) {
      parser.Push(this.ParseUnits(parser,num));
    },


    Parse_SI: function (parser,num,units) {
      parser.Push(this.ParseNumber(parser,num));
      parser.Push(this.ParseUnits(parser,units));
    },
    
    //
    ParseNumber: function (parser,expr) {
      return TEX.Parse(expr,parser.stack.env).mml();
    },
    
    ParseUnits: function (parser,expr) {
      return SIUnitParser(expr,parser.stack.env).mml();
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
    //  Implements \ce and friends
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
