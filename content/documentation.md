---
title: Learning to Plop
layout: documentation.hbs
---

# Getting Started
`plop v1.8.0`

## What is Plop?
Plop is a what I like to call a "micro-generator framework." Now, I call it that because it is a small tool that gives you a simple way to generate code or any other type of flat text files in a consistent way. You see, we all create structures and patterns in our code (routes, controllers, components, helpers, etc). These patterns change and improve over time so when you need to create a NEW *insert-name-of-pattern-here*, it's not always easy to locate the files in your codebase that represent the current "best practice." That's where plop saves you. With plop, you have your "best practice" method of creating any given pattern in CODE. Code that you can easily engage from the terminal by simply typing `plop`. Not only does this save you from hunting around in your codebase for the right files to copy, but it also turns "the right way" into "the easiest way" to make new files.

If you boil plop down to its core, it is basically glue code between  [inquirer](https://github.com/SBoudrias/Inquirer.js/) prompts and [handlebar](https://github.com/wycats/handlebars.js/) templates.

> This documentation is a work in progress. If you have great ideas, I'd love to hear them.

## Installation
### 1. Add plop to your project
```
$ npm install --save-dev plop
```
### 2. Install plop globally (optional, but recommended for easy access)
```
$ npm install -g plop
```
### 3. Create a plopfile.js at the root of your project
``` javascript
module.exports = function (plop) {
	// create your generators here
	plop.setGenerator('basics', {
		description: 'this is a skeleton plopfile',
		prompts: [], // array of inquirer prompts
		actions: []  // array of actions
	});
};
```

## Your First Plopfile
A plopfile starts its life as a lowly node module that exports a function that accepts the `plop` object as its first parameter.

``` javascript
module.exports = function (plop) {};
```

The `plop` object exposes the plop api object which contains the `setGenerator(name, config)` function. This is the function that you use to (wait for it) create a generator for this plopfile. When `plop` is run from the terminal in this directory (or any sub-directory), a list of these generators will be displayed.

Let's try setting up a basic generator to see how that looks.

``` javascript
module.exports = function (plop) {
	// controller generator
	plop.setGenerator('controller', {
		description: 'application controller logic',
		prompts: [{
			type: 'input',
			name: 'name',
			message: 'controller name please'
		}],
		actions: [{
			type: 'add',
			path: 'src/{{name}}.js',
			templateFile: 'plop-templates/controller.hbs'
		}]
	});
};
```

The *controlller* generator we created above will ask us 1 question, and create 1 file. This can be expanded to ask as many questions as needed, and create as many files as needed. There are also additional actions that can be used to alter our codebase in different ways.

## CLI Usage
Once plop is installed, and you have created a generator, you are ready to run plop from the terminal. Running `plop` with no parameters will present you with a list of generators to pick from. You can also run `plop [generatorName]` to trigger a generator directly.

## Why Generators?
Because when you create your boilerplate separate from your code, you naturally put more time and thought into it.

Because saving your team (or yourself) 5-15 minutes when creating every route, component, controller, helper, test, view, etc... [really adds up](https://xkcd.com/1205/).

Because [context switching is expensive](http://www.petrikainulainen.net/software-development/processes/the-cost-of-context-switching/) and saving time is not the only [benefit to automating workflows](https://medium.com/@kentcdodds/an-argument-for-automation-fce8394c14e2)

# Plopfile Api
The plopfile api is the collection of methods that are exposed by the `plop` object. Most of the work is done by [`setGenerator`](#setgenerator) but this section documents the other methods that you may also find useful in your plopfile.

## Main Methods
These are the methods you will commonly use when creating a plopfile. Other methods that are mostly for internal use are list in the [other methods](#other-methods) section.

Method | Parameters | Returns | Description
------ | ---------- | ------- | -----------
[**setGenerator**](#setgenerator) | String, [GeneratorConfig](#-interface-generatorconfig-) | *[GeneratorConfig](#-interface-generatorconfig-)* | setup a generator
[**setHelper**](#sethelper) | String, Function | | setup handlebars helper
[**setPartial**](#setpartial) | String, String | | setup a handlebars partial
[**setActionType**](#setactiontype) | String, [CustomAction](#-functionsignature-custom-action) | | register a custom action type
[**setPrompt**](#setprompt) | String, InquirerPrompt | | registers a custom prompt type with inquirer
[**load**](https://github.com/amwmedia/plop/blob/master/plop-load.md) | Array[String], Object, Object | | loads generators, helpers and/or partials from another plopfile or npm module

## setHelper
`setHelper` directly corresponds to the handlebars method `registerHelper`. So if you are familiar with [handlebars helpers](http://handlebarsjs.com/expressions.html#helpers), then you already know how this works.

``` javascript
module.exports = function (plop) {
	plop.setHelper('upperCase', function (text) {
		return text.toUpperCase();
	});

	// or in es6/es2015
	plop.setHelper('upperCase', (txt) => txt.toUpperCase());
};
```

## setPartial
`setPartial` directly corresponds to the handlebars method `registerPartial`. So if you are familiar with [handlebars partials](http://handlebarsjs.com/partials.html), then you already know how this works.

``` javascript
module.exports = function (plop) {
	plop.setPartial('myTitlePartial', '<h1>{{titleCase name}}</h1>');
	// used in template as {{> myTitlePartial }}
};
```

## setActionType
`setActionType` allows you to create your own actions (similar to `add` or `modify`) that can be used in your plopfiles. These are basically highly reusable [custom action function](#custom-action-function-)s.

### *FunctionSignature* Custom Action
Parameters | Type | Description
---------- | ---- | -----------
1) answers | Object | Answers to the generator prompts
2) config | [ActionConfig](#-interface-actionconfig-) | The object in the "actions" array for the generator
3) plop | [PlopfileApi](#plopfile-api) | The plop api for the plopfile where this action is being run

``` javascript
module.exports = function (plop) {

	plop.setActionType('doTheThing', function (answers, config, plop) {
		// do something
		doSomething(config.configProp);
		// if something went wrong
		throw 'error message';
		// otherwise
		return 'success status message';
	});

	// or do async things inside of an action
	plop.setActionType('doTheAsyncThing', function (answers, config, plop) {
		// do something
		return new Promise((resolve, reject) => {
			if (success) {
				resolve('success status message');
			} else {
				reject('error message');
			}
		});
	});

	// use the custom action
	plop.setGenerator('test', {
		prompts: [],
		actions: [{
			type: 'doTheThing',
			configProp: 'available from the config param'
		}, {
			type: 'doTheAsyncThing',
			speed: 'slow'
		}]
	});
};
```

## setPrompt
[Inquirer](https://github.com/SBoudrias/Inquirer.js) provides many types of prompts out of the box, but it also allows developers to build prompt plugins. If you'd like to use a prompt plugin, you can register it with `setPrompt`. For more details see the [Inquirer documentation for registering prompts](https://github.com/SBoudrias/Inquirer.js#inquirerregisterpromptname-prompt). Also check out the [plop community driven list of custom prompts](https://github.com/amwmedia/plop/blob/master/inquirer-prompts.md).

``` javascript
const promptDirectory = require('inquirer-directory');
module.exports = function (plop) {
	plop.setPrompt('directory', promptDirectory);
	plop.setGenerator('test', {
		prompts: [{
			type: 'directory',
			...
		}]
	});
};
```

## setGenerator
The config object needs to include `prompts` and `actions` (`description` is optional). The prompts array is passed to [inquirer](https://github.com/SBoudrias/Inquirer.js/#objects). The `actions` array is a list of actions to take (described in greater detail below)

### *Interface* `GeneratorConfig`
Property | Type | Default | Description
-------- | ---- | ------- | -----------
**description** | [String] | | short description of what this generator does
**prompts** | Array[[InquirerQuestion](https://github.com/SBoudrias/Inquirer.js/#question)] | | questions to ask the user
**actions** | Array[[ActionConfig](#-interface-actionconfig-)] | | actions to perform

> If your list of actions needs to be dynamic, take a look at [using a dynamic actions array.](#using-a-dynamic-actions-array)

### *Interface* `ActionConfig`
The following properties are the standard properties that plop handles internally. Other properties will be required depending on the *type* of action. Also take a look at the [built-in actions](#built-in-actions).

Property | Type | Default | Description
-------- | ---- | ------- | -----------
**type** | String | | the type of action ([`add`](#add), [`modify`](#modify), [`addMany`](#addmany), [etc](#setactiontype))
**abortOnFail** | Boolean | *true* | if this action fails for any reason abort all future actions

> Instead of an Action Object, a [function can also be used](#custom-action-function-)

## Other Methods
Method | Parameters | Returns | Description
------ | ---------- | ------- | -----------
**getHelper** | String | *Function* | get the helper function
**getHelperList** | | *Array[String]* | get a list of helper names
**getPartial** | String | *String* | get a handlebars partial by name
**getPartialList** | | *Array[String]* | get a list of partial names
**getActionType** | String | *[CustomAction](#-functionsignature-custom-action)* | get an actionType by name
**getActionTypeList** | | *Array[String]* | get a list of actionType names
**getGenerator** | String | *[GeneratorConfig](#-interface-generatorconfig-)* | get the [GeneratorConfig](#-interface-generatorconfig-) by name
**getGeneratorList** | | *Array[Object]* | gets an array of generator names and descriptions
**setPlopfilePath** | String | | set the `plopfilePath` value which is used internally to locate resources like template files
**getPlopfilePath** | | *String* | returns the absolute path to the plopfile in use
**getDestBasePath** | | *String* | returns the base path that is used when creating files
**setDefaultInclude** | *Object* | *Object* | sets the default config that will be used for this plopfile if it is consumed by another plopfile using `plop.load()`
**getDefaultInclude** | *String* | *Object* | gets the default config that will be used for this plopfile if it is consumed by another plopfile using `plop.load()`
**renderString** | String, Object | *String* | Runs the first parameter (*String*) through the handlebars template renderer using the second parameter (*Object*) as the data. Returns the rendered template.

# Built-In Actions
There are several types of built-in actions you can use in your [GeneratorConfig](#-interface-generatorconfig-). You specify which `type` of action  (all paths are based on the location of the plopfile), and a template to use.

## Add
The `add` action is used to (you guessed it) add a file to your project. The path property is a handlebars template that will be used to create the file by name. The file contents will be determined by the `template` or `templateFile` property.

Property | Type | Default | Description
-------- | ---- | ------- | -----------
**path** | *String* | | a handlebars template that (when rendered) is the path of the new file
**template** | *String* | | a handlebars template that should be used to build the new file
**templateFile** | *String* | | a path a file containing the `template`
**abortOnFail** | | | *inherited from [ActionConfig](#-interface-actionconfig-)*

## AddMany
The `addMany` action can be used to add multiple files to your project with a single action. The `destination` property is a handlebars template that will be used to identify the folder that the generated files should go into. The `base` property  can be used to alter what section of the template paths should be omitted when creating files.

Property | Type | Default | Description
-------- | ---- | ------- | -----------
**destination** | *String* | | a handlebars template that (when rendered) is the path of the new file
**base** | *String* | | the section of the path that should be excluded when adding files to the `destination` folder
**templateFiles** | *[Glob](https://github.com/sindresorhus/globby#globbing-patterns)* | | glob pattern that matches multiple template files to be added
**abortOnFail** | | | *inherited from [ActionConfig](#-interface-actionconfig-)*

## Modify
The `modify` action will use a `pattern` property to find/replace text in the file located at the `path` specified. More details on modify can be found in the example folder.

Property | Type | Default | Description
-------- | ---- | ------- | -----------
**path** | *String* | | handlebars template that (when rendered) is the path of the file to be modified
**pattern** | *RegExp* | | regular expression used to match text that should be replaced
**template** | *String* | | handlebars template that should replace what was matched by the `pattern`. capture groups are available as $1, $2, etc
**templateFile** | *String* | | path a file containing the `template`
**abortOnFail** | | | *inherited from [ActionConfig](#-interface-actionconfig-)*

## Custom (Action Function)
The `Add` and `Modify` actions will take care of almost every case that plop is designed to handle. However, plop does offer custom action functions for the node/js guru. A custom action function is a function that is provided in the actions array.
- Custom action functions are executed by plop with the same [CustomAction](#-functionsignature-custom-action) function signature.
- Plop will wait for the custom action to complete before executing the next action.
- The function must let plop known what’s happening through the return value. If you return a `Promise`, we won’t start other actions until the promise resolves. If you return a message (*String*), we know that the action is done and we’ll report the message in the status of the action.
- A custom action fails if the promise is rejected, or the function throws an `Exception`

_See the [example plopfile](https://github.com/amwmedia/plop/blob/master/example/plopfile.js) for a sample synchronous custom action._

# Built-In Helpers
There are a few helpers that I have found useful enough to include with plop. They are mostly case modifiers, but here is the complete list.

## Case Modifiers
- **camelCase**: changeFormatToThis
- **snakeCase**: change_format_to_this
- **dashCase/kebabCase**: change-format-to-this
- **dotCase**: change.format.to.this
- **pathCase**: change/format/to/this
- **properCase/pascalCase**: ChangeFormatToThis
- **lowerCase**: change format to this
- **sentenceCase**: Change format to this,
- **constantCase**: CHANGE_FORMAT_TO_THIS
- **titleCase**: Change Format To This

## Other Helpers
- **pkg**: look up a property from a package.json file in the same folder as the plopfile.

# Taking it Further

There is not a lot needed to get up and running on some basic generators. However, if you want to take your plop-fu futher, read on young padawan.

## Using a Dynamic Actions Array
Alternatively, the `actions` property of the [GeneratorConfig](#-interface-generatorconfig-) can itself be a function that takes the answers data as a parameter and return the actions array.

This allows you to adapt the actions array based on provided answers:

``` javascript
module.exports = function (plop) {
	plop.setGenerator('test', {
		prompts: [{
			type: 'confirm',
			name: 'wantTacos',
			message: 'Do you want tacos?'
		}],
		actions: function(data) {
			var actions = [];

			if(data.wantTacos) {
				actions.push({
					type: 'add',
					path: 'folder/{{dashCase name}}.txt',
					templateFile: 'templates/tacos.txt'
				});
			} else {
				actions.push({
					type: 'add',
					path: 'folder/{{dashCase name}}.txt',
					templateFile: 'templates/burritos.txt'
				});
			}

			return actions;
		}
	});
};
```
