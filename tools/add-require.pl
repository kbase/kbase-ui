#!/usr/bin/perl

# for example:
# ./add-require.pl `find . -name '*.js'`
#
# will iterate through all files passed in, open 'em up, read 'em, rewrite 'em, and write back to the same spot
# If it thinks it failed, it will not change them

local $/ = undef;

foreach my $file (@ARGV) {
    open my $fh, '<', $file;
    my $widget = <$fh>;
    close $fh;


    my $name = $1 if $widget =~ /KBWidget[\s\r]*\([\s\r]*{[[\s\r]*name\s*:\s*['"](\w+)/;
    my @deps = ();

    while ($widget =~ /\.(kbase[a-zA-Z]+)/g) {
        push @deps, $1;
    }

    if ($widget =~ /parent\s*:\s*['"](kbase[a-zA-Z]+)/) {
        push @deps, $1;
    }

    my %seen = ($name => 1);
    @deps = grep {! $seen{$_}++} @deps;
    unshift @deps, 'jquery', 'kbwidget';

    if ($widget =~ /define\s*\(\s*\[/) {
        warn "Already has define : $file";
        next;
    }

    my $s1 = $widget =~ s/\s*\(\s*function\s*\(\s*\$\s*(,\s*undefined)?\s*\)\s*{/rewrite($name, @deps)/e;

    my $s2 = $widget =~ s/}\s*[()]?\s*\(\s*jQuery\s*\)\s*\)?\s*;?/});/;

    #my ($s1, $s2) = (1,1);

    if ($name && $s1 && $s2) {
        open my $fh, '>', $file;
        print $fh $widget;
        close $fh;
    }
    else {

        if ($widget !~ /KBWidget/) {
            warn "Not a KBWidget! ($file)";
        }

        elsif (! $s1) {
            warn "Could not rewire jquery function def for $file";
        }

        elsif (! $s2) {
            warn "Could not rewire jquery function arg for $file";
        }

        elsif (! $name) {
            warn "Cannot process widget! No name known! ($file)";
        }

    }
}

sub rewrite {

    my ($name, @deps) = @_;

    my $deps = join(",\n\t", map {"'$_'"} @deps);

return <<"eDef";
define('$name',
    [
        $deps
    ],
    function (\$) {
eDef


}
