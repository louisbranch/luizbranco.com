+++
date = "2015-08-31T16:12:37-04:00"
title = "Android backup using MTP"
tags = ["cmdline", "linux", "android"]
+++

**TL/DR** Fast way to backup an android device on Linux using the USB cable, MTP
and rsync

[Media Transfer Protocol](https://wiki.archlinux.org/index.php/MTP) is available
on most Android devices as the primary method for USB synchronization. On Linux
there are several implementations of MTP on top of libmtp.

<!--more-->

On Nexus 5 both mtpfs and jmtps were *extremely* slow copying files. On this
device, [go-mtpfs](https://github.com/hanwen/go-mtpfs) had the best performance
by far copying 9gb of data, but your mileage may vary.

Assuming that you have `go-mtpfs` and `rsync` installed and the device is
connected:

{{< highlight shell >}}

mkdir -p ~/mnt ~/backup

go-mtpfs ~/mnt &

rsync -rP ~/mnt ~/backup

fusemount -u ~/mnt

{{< /highlight >}}

`-rP` on rsync stands for recursive and with progress. It's worth checking the
documentation for additional flags that might be useful to you. `-c` can be
used for recurrent backups to avoid copying files already on disk by computing
their checksum.
