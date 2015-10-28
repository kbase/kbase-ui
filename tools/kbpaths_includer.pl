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
my %deps = ();

find (\&wanted, $root);


sub wanted {
    if (/\.js$/) {

        my $route = $_;
        #kb_define('kbwidget', ['jquery', 'handlebars'],
        open my $fh, '<', $route;
        local $/ = undef;
        my $file = <$fh>;

        close $fh;

        (my $path = $File::Find::name) =~ s/$root//;

        if ($path =~ /^widgets/) {
            $path =~ s!^widgets/!!;
        }
        else {
            $path = "../$path";
        }

        (my $name = $_) =~ s/\.js$//;
        $paths{$name} = $path;

        return if $name =~ /kbpaths|kbaseWidgetTemplate|kbaseGenomeCardManager|kbaseHello|kbaseLandingPageCard|kbaseSpecCommon|sampleMain/;

        my @deps = ();

        if ($file =~ /kb_define\('([^']+)',\s*\[([^]]+)/s) {
            my $module = $1;
            my $deps = $2;
            $deps =~ s/'//g;
            $deps =~ s/\s+//gs;
            @deps = grep {length} grep { !/jquery|bootstrap|d3|handlebars/} split /,/, $deps;
        }

        $deps{$name} = { path => $path, deps => \@deps };
    }

}

my %seen = ();

sub depdealer {
    my $module = shift;

    return '' if $seen{$module}++;
    my @ret = ();
    foreach my $dep ( @{ $deps{$module}->{deps} } ) {
        push @ret, depdealer($dep);
    }

    if (! length $deps{$module}->{path}) {
        print STDERR "NO PATH FOR $module\n";
    }

    push @ret, "<script src = '/src/widgets/$deps{$module}->{path}'></script>";

    return join("\n", @ret);

}

my $pathsStr = <<"ePathsStr";

<link href="/ext/bootstrap/3.3.0/css/bootstrap.min.css" rel="stylesheet">
<link href="/ext/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

<script src="/ext/jquery/jquery-1.10.2.min.js"></script>

<script src="/ext/jquery-ui/1.10.3/js/jquery-ui-1.10.3.custom.min.js"></script>
<script src="/ext/bootstrap/3.3.0/js/bootstrap.min.js"></script>
<script src="/ext/d3/d3.v3.min.js"></script>
<script src="/ext/handlebars/handlebars-v1.3.0.js"></script>

<!-- <script data-main = '../../src/kbpaths' src = '../../ext/requirejs/2.1.9/require.js'></script> -->

<script type = 'text/javascript'>
    var kb_use_require = false;

    var kb_norequire = function(deps, callback) {
        callback(jQuery);
    };

    var kb_nodefine = function(module, deps, callback) {
        callback(jQuery);
    };

    if (kb_use_require) {
        kb_define = define;
        kb_require = require;
    }
    else {
        kb_define = kb_nodefine;
        kb_require = kb_norequire;
    }
</script>

ePathsStr

foreach my $module (keys %deps) {
    $pathsStr .= depdealer($module) . "\n";
}

$pathsStr =~ s/\n\n+/\n/g;

$pathsStr .= <<"ePathsStr";
    <script type = 'text/javascript'>
        <!--
            kb_require(['kbpaths'], function() {
                kb_require(['jquery', 'all'],
                    function(\$) {
                        //add initialization code
                    }
                )
            })
        -->
    </script>
ePathsStr

print $pathsStr, "\n";
exit;

