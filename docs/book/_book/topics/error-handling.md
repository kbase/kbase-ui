# Error Handling

Error handling is a continually vexing issue.

We often write code as if errors will not occur. After all, nearly every statement or expression could invoke an error. And what is an error? Must it meet the technical definition of an "exception"? How do we communicate an error condition to the user? What can the user do about the error that has been revealed to them?

As UI engineers, our task is to guide the user through the application, helping prevent user errors, detecting application errors of many kinds, attempting to prevent or ameliorate application errors, and if all else fails, presenting the user with a meaningful statement of an error condition and actions they can take to resolve it.

Topics covered:

- The Origin of Errors
- Severity of Errors
- Error Flow 
- Representing Errors
- Communicating Errors to Users
- Communication Errors to KBase
- Preventing Errors

## The Origin of Errors

First we must understand the origin of errors, how they are generated and by whom. We may need to treat errors differently by origin. A *user-generated* error is very different from an application error -- the user has good knowlege of actions they have recently taken, and if one of them led to an error they can easily rectify it. Problems with a user's *browser* may not be readiliy apparent to the user, but are within their grasp. *Application* and *service* errors, however are well beyond the capabilty of a typical user to deal with, but we are very interested in receiving as much context about these errors as possible, either through automated telemetry or through user feedback.

Here is an attempt to catalog the types of errors we may encounter, grouped by the general source:

User errors:

- invalid user input
- unexpected use interaction

Client errors:

- incompatible browser
- incompatible browser configuration (plugins)
- incompatible language implementation
- incompatible or erroneous browser api (DOM)

Application Errors:

- programming bug
    - syntax error
    - usage errors (undefined variable, method call on null or undefined value)
- incorrect handling of api errors
- dependency errors 
    - internal dependency errors
    - third party dependency errors

Service Errors:

- service is down
- service performance is out of expected range (e.g. timeout)
- service returns unexpected error
- service returns expected error
- incorrect configuration in comm layer (e.g. proxy)

Deployment Error
- deployment configuration error
- deployment runtime error

Infrastructure Error
- network error
- computer error
- browser error

### User Errors

#### User Input Error

In many situations a user may be expected to provide invalid input. The ui should seek to constrain user input as much as possible in order to reduce the likelihood of this. For instance, usage of checkboxes or choice lists (select, select2, etc.) restrict a user to only selecting values that are defined to be valid. However, any value input, text or number, represent an opportunity for a user to provide invalid input.

Additionally, a user may attempt to invoke an operation without complete or with invalid input for that mode. For instance, submitting a form without all required data fillled in. This type of error can be avoided by ui design.

## Severity and Scope of Errors

Another way to think about errors is the severity of their impact upon the application, the user's ability to complete their task successfully, and which parts of the application are affected.

May errors may 

- notable but harmless conditions: notes
- errors which may limit functionality but otherwise do not block the application: warnings
- errors which are user-fixable within the context of the application, temporary
- errors which are user-fixable but outside the context of the application
- temporary errors
- permanent errors
- erros which affact a single limited function
- errors which affect the entire application

### Severity

#### notable

Many conditions within an application may be detected and yet present no threat to the user's ability to get work done, or the application's stability. These are often either simply ignored, or may be reported in the browser console as an *info* console message.

> The *info* console method is one of the allowed console methods, according to the KBase style guide. It should be used to communicate to the advanced user or developer notable events in the application execution which are indicative of normal operation.

> Note: Our style guidelines indicate that we may use info, warn, and error console methods, but not log. Log should be reserved for program debugging and removed from released code.

#### warnings

Some conditions may represent a deterioration of the applications functionality or performance, yet do not represent such a threat that the typical user needs to know about them. These warnings should be reported into the browser console using the *warn* method.

#### strong warnings

At other times, a condition may require a warning to be presented to the user to allow them to be aware of imminent danger. There is a fine line between a strong warning and an error. I think the main differentiation is that a strong warning gives the user the choice of continuing to use the application, knowing that something might go wrong. For instance, the performance of services may be low, latency high, an object about to be overwritten. The user may decide to continue, or adjust their behavior or expectations accordingly.

#### limited error

Many times, especially in an application composed of dozens or hundreds of independent components, an error will be restricted to just one limited piece of the application. This error, by definition, represents a problem which prevents usage of that component. In some cases this error is fixable by the user. For instance, invalid input to a control will be reported as an error, but a user may simply provide the correct input (if they can).

The scope of an error is one of the key issues in user interface error handling, and is the topic of much discussion later. 

The source for a limited error may be varied -- invalid user input, a bug in a component, an error in a service dependency.

These are the main types of limited errors:

- control
- widget
- panel
- plugin

#### application error

The most severe type of error is the application error. It is one of the most important errors to handle well, and one of the trickiest. This is because an application error can severely impact the ability of the application to do anything, even handle or communicate an error.

We try very hard to ensure that the most severe errors are indeed captured and reported to the user.



## Error Flow

Where errors come from, how to propagate them (or not), and which application layer handles them is perhaps one of the most difficult challenges to the application developer. 

Generally we can say that an error originates in a very specific location, may be propagated through one or more software layers, may be handled at a one or more software layer, and may result in one or more outputs which may or may not be user-visible!

We would like to constrain any "may" in the statement above, quality them, perhaps turn them into "musts".

### Origination of Errors

We've already discussed in detail the origin of errors. Lets just recap for conciseness

The identification of the origin of an error is critical, because in the end it allows us to point to the cause of the error for users, support staff and developers. At development time it is very helpful if our environments point to the ultimate cause of an error. [talk about this more later -- being able to trace the flow of an error...]

In addition to the point of failure, we also need to identify the component which noticed or encountered the error. An error occurs, but is typically determined or caught by some software component. It is important to identify this as well, as it often is the location in the codebase which can tell us the most about the error.

### Avenues of Program Error Flow Control

Fundamental to understanding how errors do flow through the ui is the mechanisms by which those flows are realized. There are perhaps too many ways for these to occur, but they all are either inherent to the Javascript ecosystem or the problem domain of kbase and asynchronous Javascript applications.

- try/catch non-local return
- normal function return value
- promise chain (catch)
- pub/sub error message
- kbase json/rpc error status + value
- other network api status and/or value

#### Non-local thrown Exceptions

In Javacript, the "throw" keyword, as well as internal detection of runtime errors, may be used to provide "non-local return" of special error values, known as exceptions.

Non-local return means that the function is exited without an explicit "return" or reaching the end of the function. There is no "return" value, but there is a "caught exception", if the calling code "wraps" the call within a catch block.

Javascript runtime errors generally indicate a programming bug, but many other contexts may choose to throw an exception to indicate an error condition. There is much debate over whether exceptions should be reserved for "exceptional conditions", and considered severe erorrs, or should be used as a convenient technique for exiting from deeply nested code when an erroneous condition is decected.

The usage of typed exception values (and well-typed ones are derived from Error) is good practice, in that it allows the caller (the one wrapping the call within a catch block) to detect the precise nature of the error and conditionalize handling of the error based on the type. 

Well designed apis, especially general purpose libraries, may use well-typed exception values to provide a consistent, generic, and useful method for error detection and evaluation. In practice, however, many usages of exceptions are very generic, throwing the basic "Error" object, leaving only the message and stacktrace as clues to the nature of the error.

(More on this in the discussion of promise chain errors.)

Also, due to the verbosity of try .. catch blocks, and the need to nest them to attain suitable levels of granularity, they should be used sparsely, and primarily at locations at which unexpected results are actually quite common -- the best example perhaps being network calls.

However, the strength of well-typed exceptions also reveals their weakness -- they are very specific to the implementation domain which emitted them. This is rarely useful to the end user. Therefore, excpetions are typically caught, evaluated, and then translated to another error format. They may be retransmitted as another thrown exception, or via another mechanism.

#### Normal Function Return Values




#### Examples

#### User Entry Error

A user is faced with a numeric entry for an app cell. The ui identifies the range of values acceptable to the input, say integers from 0 to 100. Due to the number of possible values, the ui controls is a simple text input, with the range of values specified with the minimum on the left, the maximum on the right. If the app itself receives a value outside this range, it will encounter an error condition, and issue an error while running. This may be several minutes after the app run request was issued. The error message may be confusing to the end user, because the app is designed with the expectation that the front end will ensure that only valid input is provided.

Nevertheless, the user may enter invalid input inadvertently and without noticing. They may strike a key twice by accident and enter 899 rather than 89.

The control itself is designed to call a validation function for every keystroke. The validation function, in turn, is provided the current value of the control as well as the specification for the input parameter. (Which in turn is provided by the app author and has already been fetched from the module service.) The validation function returns its assesment of the input value, which indicates that it is invalid due to exceeding the maximum value in the range constraint.

The control then notices the invalid state of the value, and creates a small error message below the control, with a red background and a concise error message.

It also propagates the validation return value through a "validation" message, to its container. It's container main in fact be another container. This container may also provide error feedback, for example a red outline or background color. Thus the error state may propagate up the container "stack" until it reaches the app controller itself. At this point, the validation state will disable the ability to Run the app (if it was enabled before), and will finally be discarded, stopping the flow of the error.

The origin of the error? The user
The catcher of the error? The validation function
The primary handler of the error? The proximate numeric input control
The secondary handlers of the errors? The container controls
The stopping point of the error? The app controller


...


## Representing Errors

Error representation is another sticky wicket.

- standard Javascript error objects
- custom Javascript error objects
- Contextual error interfaces (message, message + field)
- Rich ui error message (message, detail, references, raw data, stacktrace)

The common denominator for error representation, across all languages and systems, is the error message string; a concise, short description of the error and its cause

However, this is not a sufficient representation to guide error flow, handling, or communication to the user.

### Javascript Errors

Javascript itself is very flexible with error handling. Language level errors are usually thrown using "throw", and caught using "catch", but the value being thrown may be any value. The idiomatic best practice is to use Error or a derivative of Error. By inspecting the prototype of a thrown value, one may determint the "type" of an error this way.






## Appendix

### Sorry, an aside on Javascript

Because we utilize vanilla Javascript in the front end code, there is much opportunity for all types of application error -- core, component, widget, even third party library. Some solutions for this which we really must focus on:

- code quality tools at all times - linter, formatter
- established coding patterns - how to write a module, for instance
- unit testing all libraries
- integrative testing for all widgets
- end-to-end testing for the core app

However, I would also caution against too much investment in these areas at the moment. We should think about fundamental changes to our codebase as well, to make it more testable. For instance, super-languages may be more suitable:

- typescript - code consistency, good static analysis, good unit testing story, can be integrated as libraries into existing codebase
- clojurescript - very concise code, good unit testing story, good runtime validation story, good code compilation story (google closure), good generative testing, not sure about integration with existing codebase, good candidate for rewrite of kbase-ui (maybe not libraries, components, or widgets).

