(function(angular){
  var proxyInjector = {
    queue: [],
    addDirective: function(directive){
      this.queue.push(directive);
    }
  };

  var module = angular.module('ngCssInjector', []);
  new Promise(function(resolve, reject){
    module.factory('cssInjector', ['$timeout', '$document', '$templateRequest',
        function($timeout, $document, $templateRequest){
          var directives = {};
          var SNAKE_CASE_REGEXP = /[A-Z]/g;
          var injector = {
            addDirective: function(directive){
              //postpone directive processing until angular adds
              //missing properties
              $timeout(addDirective, 0, false, directive);
            }
          }
          $timeout(resolve, 0, false, injector);
          return injector;

          function hyphenated(name, separator){
            return name.replace(SNAKE_CASE_REGEXP, function(letter, pos){
              return (pos ? '-' : '') + letter.toLowerCase();
            });
          }

          function appendStyle(cssText, id){
            $document.find('body').append(angular.element('<style>').attr('id', 'directive-' + id).text(cssText));
          }

          function addDirective(directive){
            var id = hyphenated(directive.name);
            if(directive.index > 0)
              id += '-' + directive.index;
            if(!(id in directives)){
              directives[id] = directive;
              if('css' in directive)
                appendStyle(directive.css, id);
              else if('cssUrl' in directive){
                $templateRequest(directive.cssUrl).then(function(cssText){
                  appendStyle(cssText, id);
                }, angular.noop);
              }
            }
          }
        }]);
  }).then(function(cssManager){
    proxyInjector.queue.forEach(cssManager.addDirective, cssManager);
    proxyInjector = cssManager;
  });
  module.decorator('$injector', ['$delegate', function($injector){
    //we cannot explicitly inject cssManager here because it depends 
    //on services dependent on the injector being instantiated
    var invoke = $injector.invoke;
    $injector.invoke = function(){
      var result = invoke.apply(this, arguments);
      //We are only interested in directives and for them angular adds
      //extra step of construction to handle missing recipe properties.
      //We cannot detect serviceName this way but at least we know that 
      //every directive factory is invoked using exactly one argument.
      //It's not accurate, there are still false positives.
      if(result && arguments.length === 1)
        detectAndProcessCssDirective(result);
      return result;
    };
    return $injector;

    function detectAndProcessCssDirective(directive){
      if(('css' in directive) || ('cssUrl' in directive)){
        proxyInjector.addDirective(directive);
      }
    }
  }]).run(['cssInjector', function(){
    //force angular to instantiate the manager
  }]);
})(angular);
