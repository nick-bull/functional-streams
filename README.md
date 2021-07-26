Functional programming for streams. WIP; most of this does not work.

**Deprecated** as I discovered RxJS, that does all this and more! :) 

## Installation

```
npm i @nick-bull/functional-streams
```

## Usage

```
import {
  delay,
  map,
  not,
  pipe,
  retry,
  stream,
  timeout,
  until,
} from 'nick-bull/functional-streams';

const double = async i => i * 2;
const tooBig = async i => i > 15;

const {output, cancel} = await stream(
  pipe(
    delay(1000),
    map(double),
    until(not(tooBig)),
  ),
  timeout(10000),
  retry(3),
);
```

