# When running in a development environment, you don't need to change
# this. When building a package, though, you should supply a full path
# to a file that all users can access, i.e.:
#
#     make DEFAULT_MAP=/usr/share/asciiworld/ne_110m_land.shp
#
DEFAULT_MAP = `readlink -f ne_110m_land.shp`
CPPFLAGS += -DDEFAULT_MAP=\"$(DEFAULT_MAP)\"

__NAME__ = asciiworld

CFLAGS += -Wall -Wextra -O3 `pkg-config --cflags gdlib`
LDLIBS += -lm -lshp `pkg-config --libs gdlib`

INSTALL = install
INSTALL_PROGRAM = $(INSTALL)
INSTALL_DATA = $(INSTALL) -m 644

prefix = /usr/local
exec_prefix = $(prefix)
bindir = $(exec_prefix)/bin
datarootdir = $(prefix)/share
docdir = $(datarootdir)/doc
mandir = $(datarootdir)/man
man1dir = $(mandir)/man1


.PHONY: all clean install installdirs

all: $(__NAME__)

install: $(__NAME__) installdirs
	$(INSTALL_PROGRAM) $(__NAME__) $(DESTDIR)$(bindir)/$(__NAME__)
	$(INSTALL_PROGRAM) $(__NAME__)-sat-get $(DESTDIR)$(bindir)/$(__NAME__)-sat-get
	$(INSTALL_PROGRAM) $(__NAME__)-sat-calc $(DESTDIR)$(bindir)/$(__NAME__)-sat-calc
	$(INSTALL_PROGRAM) $(__NAME__)-sat-track $(DESTDIR)$(bindir)/$(__NAME__)-sat-track
	$(INSTALL_PROGRAM) $(__NAME__)-ip-geo $(DESTDIR)$(bindir)/$(__NAME__)-ip-geo
	$(INSTALL_PROGRAM) $(__NAME__)-tcp-monitor $(DESTDIR)$(bindir)/$(__NAME__)-tcp-monitor
	$(INSTALL_PROGRAM) $(__NAME__)-waypoints $(DESTDIR)$(bindir)/$(__NAME__)-waypoints
	$(INSTALL_DATA) ne_110m_land.shp $(DESTDIR)$(datarootdir)/$(__NAME__)/ne_110m_land.shp
	$(INSTALL_DATA) ne_110m_land.shx $(DESTDIR)$(datarootdir)/$(__NAME__)/ne_110m_land.shx
	$(INSTALL_DATA) README $(DESTDIR)$(docdir)/$(__NAME__)/README
	$(INSTALL_DATA) README-tools.md $(DESTDIR)$(docdir)/$(__NAME__)/README-tools.md

installdirs:
	mkdir -p $(DESTDIR)$(bindir) \
		$(DESTDIR)$(datarootdir)/$(__NAME__) \
		$(DESTDIR)$(docdir)/$(__NAME__)

clean:
	rm -f $(__NAME__)
