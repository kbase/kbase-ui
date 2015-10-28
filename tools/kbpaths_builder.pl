#!/usr/bin/perl

#
#      run ./kbpaths_builder.pl > src/kbpaths.js
# then run ./finder.pl --all > src/widgets/all.js
#

use File::Find;

use strict;
use warnings;

my $root = 'src/';

my %paths = ();

find (\&wanted, $root);

sub wanted {
    if (/\.js$/) {
        (my $path = $File::Find::name) =~ s/$root//;
        $path =~ s/\.js$//;

        if ($path =~ /^widgets/) {
            $path =~ s!^widgets/!!;
        }
        else {
            $path = "../$path";
        }

        (my $name = $_) =~ s/\.js$//;

        return if $name =~ /kbpaths|kbaseWidgetTemplate|kbaseGenomeCardManager|kbaseHello|kbaseLandingPageCard|kbaseSpecCommon|sampleMain/;

        $paths{$name} = $path;
    }

}

my $maxKeyLen = 0;
foreach my $key (keys %paths) {
    if (2 + length $key > $maxKeyLen) {
        $maxKeyLen = 2 + length $key;
    }
}

my $formatStr = "\t\t\t\t%-" . $maxKeyLen . "s : '%s',";
#print "$formatStr\n";exit;

my $pathsStr = join(
    "\n",
        map
            {sprintf($formatStr, "'" . $_ . "'", $paths{$_})}
            sort
                { $paths{$a} cmp $paths{$b} || $a cmp $b }
                keys %paths
);

my $all = join("\n", map {"\t'$_',"} grep {$_ ne 'all'} sort keys %paths);

if (@ARGV) {
    print <<"eKBALL";
kb_define('all',
    [
$all
    ],
    function() {

    }
);
eKBALL
}
else {
print <<"eKBPaths";
    kb_define('kbpaths', [], function(paths) {
        requirejs.config({
            baseUrl : 'src/widgets',
            urlArgs: "bust=" + (new Date()).getTime(),
            paths : {
                'jquery'      : '../../ext/jquery/jquery-1.10.2.min',
                'jqueryui'    : '../../ext/jquery-ui/1.10.3/js/jquery-ui-1.10.3.custom.min',
                'bootstrap'   : "../../ext/bootstrap/3.3.0/js/bootstrap.min",
                'd3'          : "../../ext/d3/d3.v3.min",
                'colorbrewer' : "../../ext/colorbrewer/colorbrewer",
                'handlebars'  : '../../ext/handlebars/handlebars-v1.3.0',
$pathsStr
            },
            shim : {
                bootstrap : {deps : ["jquery"]}
            }
        });
    });
eKBPaths

}
