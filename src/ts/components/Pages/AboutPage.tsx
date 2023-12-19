import "./Pages.less";

export default function AboutPage() {
    return (
        <div className="page-content page-paragraph-container">
            <p>
                Cog-Minder is a helper website for <a href="https://www.gridsagegames.com/cogmind/">Cogmind</a>. It has
                a <a href="parts.html">parts searcher</a> that takes information from the in-game gallery CSV export and
                turns it into this searchable webpage, a <a href="bots.html">bots bestiary</a> that lists all bots in
                the game and their stats, a <a href="build.html">build planner</a> that allows for creating a build
                loadout and viewing stats for it, a <a href="combat.html">combat log analyzer</a>, a{" "}
                <a href="hacks.html">hacking calculator</a> that shows hacking success rates, a{" "}
                <a href="simulator.html">combat simulator</a> that predicts combat outcomes from a collection of
                equipped parts, a <a href="rif.html">RIF reference</a> for RIF abilities and bot hacking, and an
                unofficial <a href="wiki.html">Wiki</a>. It should have all items and bots as of Beta 11, let me know if
                anything seems missing.
            </p>
            <p>
                This is an MIT licensed open source project with the source available on{" "}
                <a href="https://github.com/noemica/cog-minder">GitHub</a>.
            </p>
            <p>
                Thanks to Valguris, PI-314, GJ, ZXC, MTF, and Captain Croissandwich from the roguelike discord for
                donating early gallery exports, PlasticHeart for creating the{" "}
                <a href="https://github.com/plhx/cogfont">Cog and Smallcaps font files</a>, and Kyzrati for making
                Cogmind.
            </p>
        </div>
    );
}
