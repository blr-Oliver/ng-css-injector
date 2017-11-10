# ng-css-injector
angular.js module for injecting directive's CSS into document at runtime

# What is this for?
This module helps you to associate a directive with its stylesheet same way as it works for directive's template, loading stylesheet automatically as directive is used. Also it allows to ship directive as a single *.js* file with embedded template and stylesheet. 

# What can this do?
This module supports both inline styles and separate stylesheet resources. Injecting stylesheets is lazy (default angular behavior for directive templates) and access to stylesheets is performed via standard `$templateRequest` (it indeed means it can be intercepted as well as `&templateCache` content preloaded - see example). Currently only single `css` or `cssUrl` entry is supported. 

# What can NOT this do?
This module cannot manage your CSS bindings dynamically or maintain dynamic stylesheet list at runtime. This module cannot handle CSS associated with scopes other but directive (if you want some auto-CSS stuff for routing/controllers, try [angular-css](https://github.com/castillo-io/angular-css)).

# Examples

## Inline css

```javascript
module.directive('boldWow', [function(){
  return {
    restrict: 'E',
    template: `<span class="bold-wow">Wow!</span>',
    css: '.bold-wow { font-weight: bold; }'
  }
}])
```

## Separate stylesheet

```javascript
module.directive('boldWow', [function(){
  return {
    restrict: 'E',
    template: `<span class="bold-wow">Wow!</span>',
    cssUrl: '/css/bold-wow.css'
  }
}])
```

## Using `$templateCache`

```javascript
module.directive('boldWow', [function(){
  return {
    restrict: 'E',
    template: `<span class="bold-wow">Wow!</span>',
    cssUrl: 'bold-wow.css'
  }
}]).run(['$templateCache', function($templateCache){
  $templateCache.put('bold-wow.css', '.bold-wow { font-weight: bold; }');
}])
```

# Notes and details
 - Directive properties are accessed during its instantiation via `$injector.invoke`. As angular services are singletones, it happens at most once during application lifetime (at least it should).
 - Styles are always inserted into document as embedded `<style>` element even if `cssUrl` property is used.
 - Style DOM element is generated with id `directive-[hyphenated-directive-name]-[directiveIndex]`, where `directiveIndex` is internal angular index for tracking directives with same name and is ommited if equal to `0` (first of a family).   
 - `css` property suppresses `cssUrl` if both are present.
 - This module doesn't retry if fails to load stylesheet.