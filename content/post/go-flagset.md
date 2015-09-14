+++
date = "2015-09-13T17:57:28-03:00"
title = "Using Go os.Args and FlagSet to create cmdline subcommands"
tags = [ "go", "cmdline" ]

+++

**TL/DR** With Go `flag` package is very easy to define and parse global command
line options. However, if your application needs subcommands, using OS args and
creating flag sets is great way to define options for each subcommand.

<!--more-->

Imagine if you want to create a clone of [taskwarrior](http://taskwarrior.org/)
with `task add` and `task remove` as subcommands. The first step is to parse the
command line arguments to discover which subcommand the user is trying to
access.

{{< highlight go >}}
package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Command missing")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "add":
		// add a task
	case "remove":
		// remove a task
	default:
		fmt.Println("Command not defined")
		os.Exit(1)
	}
}
{{< /highlight >}}

`os.Args` is a string slice with the commands passed from the command line. The
first element, `os.Args[0]`, is always the name of the program. To get the
subcommand, you must first verify that there is indeed at least a second
argument, otherwise accessing the second element would be out bounds and crash
the program. A switch over `os.Args[1]` is a quick way to accomplish that. It
is always a good practice to add a default case to handle unknown inputs.

## Global Flags

The `flag` package is very handy to define command line flags, such as `-v` or
`--source=test`. Flags are important even if your program is not a command line
application, because it allows you to inject information after compile time. If
you are creating a web service, for example, the port number and an api secret
could be passed from the command line.

{{< highlight go >}}
package main

import (
	"flag"
	"fmt"
)

func main() {
	port := flag.String("port", "8080", "Server port")
	flag.Parse()
	fmt.Printf("Running on port %s\n", *port)
}
{{< /highlight >}}

Both short and long flags are defined by default, so there is no difference
between `task -port 8080` and `task --port 8080`.

The flag package also adds little goodies when you call `Parse`. The first one
is a default help text that shows by calling the program with `-h` or `-help`.
The second one is a warning when flags that are not defined are called.

You cannot, however, define a flag as required. If a flag is vital for your
program, you must validate and throw an error manually.

{{< highlight go >}}
package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	secret := flag.String("api-secret", "", "API secret for Foo service")
	flag.Parse()
	if *secret == "" {
		fmt.Println("--api-secret is required")
		os.Exit(1)
	}
}
{{< /highlight >}}

## Flag Sets

When you call `flag.String(...)` and `flag.Parse()` you are actually using a
global flag set defined inside the `flag` package. If you need more control over
the flags, like setting error behaviors for example, creating you own flag
set(s) is the way to go.

{{< highlight go >}}
package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Command missing")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "add":
		f := flag.NewFlagSet("add", flag.ExitOnError)
		tag := f.String("tag", "", "Default task tag")
		f.Parse(os.Args[2:])
		fmt.Println(*tag)
	default:
		fmt.Println("Command not defined")
		os.Exit(1)
	}
}
{{< /highlight >}}

Using flag sets is good way to isolate flag options by subcommand. In this case,
the `--tag` flag is only valid for the `add` subcommand. When using a set, the
`Parse` method needs a string slice to operate on. Usually you will pass a
subset of the `os.Args` removing the parts already parsed, in this case the
os.Args 0 and 1.

## Helping users

By default each flag set has a built-in helper text, listing all the flags
available, their default values and description. As state above, the help
information appears by passing `-h` to the program or you can show
programmatically by calling `f.PrintDefaults`.

To create a custom error message when the parsing fails, you can reassign the
`Usage` function from the flag set:

{{< highlight go >}}
f := flag.NewFlagSet("add", flag.ExitOnError)
f.Usage = func() {
  fmt.Println("Help me, Obi-Wan Kenobi.")
}
{{< /highlight >}}
