(function ($) {
  var terminal = $("#typed");
  var text = terminal.html();
  terminal.html("");
  terminal.typed({
    strings: [text],
    typeSpeed: 60,
    startDelay: 500
  });
}(jQuery));
