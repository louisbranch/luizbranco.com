+++
date = "2015-09-09T01:44:22-04:00"
title = "Benchmarking Go code"
tags = ["go", "testing"]
+++

**TL/DR** Go benchmark is a special kind of test that you can use to profile
your code and to compare performance of different implementations.

<!--more-->

When I first ported [gtt](http://github.com/luizbranco/gtt) from javascript to
go, I kept serializing the data to a file using JSON. The reason was more about
familiarity with JSON than allowing it to be human readable or expecting anyone
to edit the file by hand.

Go standard library ships with its own encoding format called
[gob](https://golang.org/pkg/encoding/gob/) (Go's binary). Migrating from one
format to the other is pretty simple because both gob and JSON implement the
Encode/Decode interfaces.

## Comparing JSON and gob performance

Before switching the encoding, I decided to run a small benchmark, encoding and
decoding a simple struct similar to what I have on my project. Benchmarks in go
are very similar to regular tests. The main differences from a test function are:

* It needs to start with **Benchmark**, in our example:
  `BenchmarkJsonRoundTrip`.

* It receives a `*testing.B` as the function argument, instead of the
  regular `*testing.T`. Both share a common struct underneath responsible
for most of the methods, like `Errorf` or `Fail`.

* It runs `b.N` times where N is a multiple of 10 big
  enough to reach the required time. By default each benchmark runs for
at least 1 second. That can be changed using cmdline flags during the test.

## Benchmark example

{{< highlight go >}}
package main

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"testing"
)

type Project struct {
	Name  string
	ID    int
	Tasks []string
}

var p = Project{
	Name:  "Test",
	ID:    1,
	Tasks: []string{"one", "two", "three"},
}

func BenchmarkJsonRoundTrip(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var file bytes.Buffer
		enc := json.NewEncoder(&file)
		dec := json.NewDecoder(&file)
		if err := enc.Encode(p); err != nil {
			b.Errorf("encode error: %s", err)
		}
		p2 := Project{}
		if err := dec.Decode(&p2); err != nil {
			b.Errorf("decode error: %s", err)
		}
	}
}

func BenchmarkGobRoundTrip(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var file bytes.Buffer
		enc := gob.NewEncoder(&file)
		dec := gob.NewDecoder(&file)
		if err := enc.Encode(p); err != nil {
			b.Errorf("encode error: %s", err)
		}
		p2 := Project{}
		if err := dec.Decode(&p2); err != nil {
			b.Errorf("decode error: %s", err)
		}
	}
}
{{< /highlight >}}

To run all benchmarks on a single file:

 `go test -bench . filename_test.go`

## The Result

{{< highlight shell >}}
PASS
BenchmarkJsonRoundTrip-8     300000         5332 ns/op
BenchmarkGobRoundTrip-8      30000         46206 ns/op
{{< /highlight >}}

The number in the middle informs how many times each benchmark ran (its `N`).
The last number is the time spent per operation, in this case in nanoseconds.

Although the struct tested is really simple, gob in this benchmark is one order
of magnitude faster than JSON. However, there are
[others](https://github.com/pquerna/ffjson) packages that offer better
performance than `encoding/json`.

Go benchmark is a very handy tool, so use it to explore different algorithms
and implementations.
