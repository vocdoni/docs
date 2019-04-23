# Sketch.Systems convention

_This document is a work in progress_

## States

- ComponentType + " - " + ElementId
- ComponentType + " - " + ElementId " - " + InternalState
- ConditionType + " - " + ElementId + "?"

### ComponentTypes

- `Enviroment` : ElementId can be `OutsideApp`/`InsideApp`
- `Page`: ElementId is the pageId. It matches Figma frame names
- `State`: Represents an internal state of the element. Can be anythingg (`active`, `inactive`, `hiden`...)
- `Evaluate`: It is a name for whatever logic needs to be evaluated. Can be anything (`LessThanFourPointsPattern`, `ZeroIdentitesCreated`, `IsProcessReference`...)

### ConditionTypes

Following sketch.system convention, for transisten states to represent momentary logic we add the `?` mark at the end

- `Check`
- `PageTransition`

## Events

- TypeOfEvent + " - " + ElementId
- TypeOfEvent + " - " + LocalizationId

### TypeOfEvents

- `TODO`: State need to be defined still
- `Evaluate`: The underling logic makes a check
- `Tap`: User taps a button
- `TypedInput`: User writes on keyboard
- `TypedtReturn`: User types the return key
- `PullToRefresh`: User pulls down and releases
- `SlideLeft`
- `TapAndHold`: User presses and releases after a while
- `OnRequestSuccess`: Success outcome after an asyncronous call
- `OnRequestFailed`: Failed  outcome after an asyncronous call
- `StillLoading`
- `DoneLoading`