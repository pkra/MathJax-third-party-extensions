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

MathJax.Hub.Register.StartupHook("TeX Jax Ready",function () {
  
  var TEX = MathJax.InputJax.TeX;
  var MML = MathJax.ElementJax.mml;
  
  var UNITSMACROS = {
    // SI base units
    ampere:   ['SIUnit', 'A'],
    candela:  ['SIUnit', 'cd'],
    kelvin:   ['SIUnit', 'K'],
    kilogram: ['SIUnit', 'kg'],
    metre:    ['SIUnit', 'm'],
    mole:     ['SIUnit', 'mol'],
    second:   ['SIUnit', 's'],
   
    // Coherent derived units
    bequerel: ['SIUnit', 'Bq'],
    degreeCelsius: ['SIUnit', '\\degree C'],
    coulomb: ['SIUnit', 'C'],
    farad: ['SIUnit', 'F'],
    gray: ['SIUnit', 'Gy'],
    hertz: ['SIUnit', 'Hz'],
    henry: ['SIUnit', 'H'],
    joule: ['SIUnit', 'J'],
    katal: ['SIUnit', 'kat'],
    lumen: ['SIUnit', 'lm'],
    lux: ['SIUnit', 'lx'],
    newton: ['SIUnit', 'N'],
    ohm: ['SIUnit', '\\Omega '],
    pascal: ['SIUnit', 'pa'],
    radian: ['SIUnit', 'rad'],
    siemens: ['SIUnit', 'S'],
    sievert: ['SIUnit', 'Sv'],
    steradian: ['SIUnit', 'sr'],
    tesla: ['SIUnit', 'T'],
    volt: ['SIUnit', 'V'],
    watt: ['SIUnit', 'W'],
    weber: ['SIUnit', 'Wb'],

    // accepted nun-SI units
    day: ['SIUnit', 'd'],
    degree: ['SIUnit', '\\circ '], // TODO: find proper symbol
    hectare: ['SIUnit', 'ha'],
    hour: ['SIUnit', 'h'],
    litre: ['SIUnit', 'l'],
    liter: ['SIUnit', 'L'],
    arcminute: ['SIUnit', '\\prime '], // plane angle; TODO: find proper symbol
    minute: ['SIUnit', 'min'],
    arcsecond: ['SIUnit', '\\prime\\prime '], // plane angle; TODO: find proper symbol
    tonne: ['SIUnit', 't'],
    
    // non-SI units whose values must be determined experimentally
    astronomicalunit: ['SIUnit', 'ua'],
    atomicmassunit: ['SIUnit', 'u'],
    bohr: ['SIUnit', 'a_0'],
    clight: ['SIUnit', 'c_0'],
    dalton: ['SIUnit', 'Da'],
    electronmass: ['SIUnit', 'm_e'],
    electronvolt: ['SIUnit', 'eV'],
    elementarycharge: ['SIUnit', 'e'],
    hartree: ['SIUnit', 'E_h'],
    planckbar: ['SIUnit', '\\hbar '],

    // Other non-SI units
    angstrom: ['SIUnit', '\\overcirc A'], // TODO: find propert symbol
    bar: ['SIUnit', 'bar'],
    barn: ['SIUnit', 'b'],
    bel: ['SIUnit', 'B'],
    decibel: ['SIUnit', 'dB'],
    knot: ['SIUnit', 'kn'],
    mmHg: ['SIUnit', 'mmHg'],
    nauticmile: ['SIUnit', ';'],
    neper: ['SIUnit', 'Np'],
    

    // SI prefixes
    yocto: ['SIPrefix',-24,'y'],
    zepto: ['SIPrefix',-21,'z'],
    atto:  ['SIPrefix',-18,'a'],
    femto: ['SIPrefix',-15,'f'],
    pico:  ['SIPrefix',-12,'p'],
    nano:  ['SIPrefix', -9,'n'],
    micro: ['SIPrefix', -6,'\\mu '],
    milli: ['SIPrefix', -3,'m'],
    centi: ['SIPrefix', -2,'c'],
    deci:  ['SIPrefix', -1,'d'],

    deca:  ['SIPrefix',  1],
    hecto: ['SIPrefix',  2,'h'],
    kilo:  ['SIPrefix',  3,'k'],
    mega:  ['SIPrefix',  6,'M'],
    giga:  ['SIPrefix',  9,'G'],
    tera:  ['SIPrefix', 12,'T'],
    peta:  ['SIPrefix', 15],
    exa:   ['SIPrefix', 18],
    zetta: ['SIPrefix', 21],
    yotta: ['SIPrefix', 24],
    
    // aliases
    meter: ['Macro','\\metre'],
    
    // abbreviations
    kg: ['Macro','\\kilogram'],
    amu: ['Macro','\\atomicmassunit'],
    kWh: ['Macro','\\kilo\\watt\\hour']
  };
  
  /*
   * I'm too lazy to write all of the abbreviations by hand now, so here it is
   * programmatically.
   */
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
    V: 'volt',
    W: 'watt',
    J: 'joule',
    eV: 'electronvolt',
    F: 'farad',
    K: 'kelvin',
    dB: 'decibel'
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
    "pV nV uV mV V kV",
    "uW mW W kW MW GW",
    "J kJ",
    "meV eV keV MeV GeV TeV",
    "fF pF F",
    "K",
    "dB"    
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
      this.cur_prefix_symbol = undefined;
      arguments.callee.SUPER.Init.call(this,string,env);
    },

    csFindMacro: function (name) {
      var macro = UNITSMACROS[name];
      if( macro ) return macro;
      
      return arguments.callee.SUPER.csFindMacro.call(this,name);
    },
    
    SIPrefix: function (name, power, pfx) {
      console.log('SIPrefix ',name,power,pfx);
      if(this.cur_prefix_power){
        TEX.Error(["SIunitx","double SI prefix",this.cur_prefix_power,power]);
      }
      this.cur_prefix_power = power;
      this.cur_prefix_symbol = pfx;
    },
    
    SIUnit: function (name, symbol) {
      console.log('SIUnit ',name,symbol,this.cur_prefix_power,this.cur_prefix_symbol);
      var pfx = this.cur_prefix_symbol || '';
      this.string = '\\mathrm{'+pfx+symbol+'}' + this.string.slice(this.i);
      this.i = 0;
      this.cur_prefix_power = 0;
      this.cur_prefix_symbol = undefined;
    }
  });
  
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
      parser.Push(this.ParseUnits(parser,num));
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
