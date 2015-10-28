#!/usr/bin/perl

# Markdown to concatenated javascript string.

print "\var markdownString = (function () {\n";
print "    var s = '';\n";
foreach $line (<STDIN>) {
    # all single quotes are escaped
    $line =~ s/\'/\\'/g;
    # all newlines become \n
    $line =~ s/\n/\\n/g;

    print "\    s += '" . $line . "';\n";
}
print "    return s;\n";
print "}());\n";