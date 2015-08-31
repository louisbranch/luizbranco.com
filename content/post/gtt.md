+++
date = "2015-08-16T20:26:20-04:00"
title = "gtt - git time tracker"
tags = ["cmdline", "git", "go"]

+++

**TL/DR** If you code and need to create regular invoices of your working hours,
you might want to give gtt a try.

## What is gtt

**g**it **t**ime **t**racker is a simple program that allows you to track how
much time you spend coding per day and, at the end of a period, generate an
invoice. Even though it has git on its name, gtt can work with any version
control system that supports commit hooks or by directly issuing commands from
the terminal.

<!--more-->

## How it works

Assuming you have downloaded [gtt](http://github.com/luizbranco/gtt/releases)
and you have added it to your PATH, this is an example of a workflow:

{{< highlight shell >}}

# creates a .gtt file in the current directory
gtt init

# adds a hook to .git/hooks/commit-msg
gtt hook git

# starts the current day
gtt start

# ...

# tracks the first line of the commit message and when it was made
git commit -m "fix bug #42"

# ...

# pauses the tracking time
gtt pause

# ... grabbing lunch :)

# resumes the time
gtt resume

# tracks a task manually (that is what the commit hook uses under the hood)
gtt task "attending a very productive meeting"

# displays how much time was spent between the start of the day and the last task, excluding pauses
gtt status
> [STATUS] 2h35m

{{< /highlight >}}

### Generating an invoice

gtt can create a simple invoice between two periods as a html page:

{{< highlight shell >}}

# outputs an html invoice to stdout, you can the write to a file
gtt invoice --from=2015-08-01 --to=2015-08-31 --cost-per-hour=1.00 > invoice.html

{{< /highlight >}}

## Why I created gtt

Almost four years ago I started working remotely for [Replay
Poker](http://www.replaypoker.com) and I needed to keep track of my hours
worked.  Since my schedule was very flexible, it was important to record the
duration of tasks and breaks. At first I said: "this is simple, I just need a
spreadsheet". That approach was a failure from the start...

Every day I would forget to update the spreadsheet and I would need to go back
to my commit history or messages on the team chat to fix missing time periods.
Then instead of days, it became weeks and, finally the whole month.

Since most my tasks were reflected as git commits, I then decided to use the
commit message and timestamp as the basic unit to keep track of my time, while
having a easy way to input other tasks, such as meetings, and pauses.

## gtt v1

On September 14th, 2012 the first version of gtt was born. It consisted of two
parts: the [cli](https://github.com/luizbranco/gtt-v1-cli), written in ruby, and
the [server](https://github.com/luizbranco/gtt-v1-server) in nodejs with CouchDB
as the database running locally.

Two fun facts about the first cli version:

1) The ``start`` ``end`` ``pause`` ``resume`` commands were integrated with
[Campfire](https://campfirenow.com/), the chat service we used to use, and
automatically would send messages to the "Lobby" room:

{{< highlight ruby >}}
opts.on("--start-day [CHAT_MESSAGE]", "Start a new working day") do |chat_msg|
  response = tracker.start_day
  chat_msg ||= 'Morning o/'
  talker.send_message(chat_msg) if talker
end
{{< /highlight >}}

2) It had 0 tests :(

{{< highlight ruby >}}
describe "Gtt" do
  it "fails" do
    fail "hey buddy, you should probably rename this file and start specing for real"
  end
end
{{< /highlight >}}

## gtt v2

Two years later, on April 2014, the version 2 started to take shape. The basic
idea for a new version was to run gtt in a SaaS style, without the need to run
the database locally. It allowed me to share the same project across multiple
devices and a web interface to view and generate invoices.

The project was then split in three parts, the
[cli](https://github.com/luizbranco/gtt-v2-cli), now written in nodejs too, the
[server](https://github.com/luizbranco/gtt-v2-server) and a front-end
[site](https://github.com/luizbranco/gtt-v2-site). This last part was,
unfortunately never finished, so the only way to generate invoice was to clone
the repo and dump the database to create the invoice.

Version 2 was more a learn experience than a successful upgrade. It allowed me
to play with javascript [generator
functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
and to write a better API for the server. Also, it had proper testing!

{{< highlight javascript >}}
it("adds a new task", function(done){
  co(function* () {
    var response = yield model.addTask(user, "important task");
    assert.deepEqual(response, "OK");
    done();
  })();
});
{{< /highlight >}}

## gtt v3

[Version 3](http://github.com/luizbranco/gtt) was recently launched and it is
still a working in progress. It removes every non-essential part of the tool and
simplify its design:

* Instead of a database it used a regular file to store the daily log. This allows
offline access, privacy, easy backup and sharing the same ``.gtt`` file using
symbolic links;

* The invoice generation is also embedded in the application and it allows
  custom date ranges. Up to version 2 only full months were allowed;

* The whole tool is a cross-platform single executable written in
  [go](http://golang.org).

If gtt can facilitate your billing workflow, please share your ideas on the
[issues](http://github.com/luizbranco/gtt/issues) page.
