import { Link } from "wouter";

import "../Pages.less";
import "./AboutPage.less";

export default function AboutPage() {
    return (
        <div className="page-content page-paragraph-container">
            <p>
                Cog-Minder is a helper website for <a href="https://www.gridsagegames.com/cogmind/">Cogmind</a>. It has
                the following:
            </p>
            <ul>
                <li>
                    A <Link href="/parts">parts reference</Link> that displays information on all items in the game
                </li>
                <li>
                    A <Link href="/bots">bots bestiary</Link> that lists all bots in the game, their part loadouts, and
                    their stats
                </li>
                <li>
                    A <Link href="/build">build planner</Link> that allows for creating a build loadout and viewing
                    various stats
                </li>
                <li>
                    A <Link href="/combat">combat log analyzer</Link> to examine combat encounters after a run
                </li>
                <li>
                    A <Link href="/hacks">hacking reference and calculator</Link> that shows hacking success rates
                </li>
                <li>
                    A <Link href="/simulator">combat simulator</Link> that predicts combat outcomes from a collection of
                    equipped parts
                </li>
                <li>
                    A <Link href="/rif">RIF reference</Link> for RIF abilities and bot hacks available
                </li>
                <li>
                    An unofficial <Link href="/wiki">Wiki</Link>
                </li>
            </ul>
            <p>
                This is an MIT licensed open source project with the source available on{" "}
                <a href="https://github.com/noemica/cog-minder">GitHub</a>. Current commit hash: {__COMMIT_HASH__}
            </p>
            <p>
                Thanks to Valguris, PI-314, GJ, ZXC, MTF, and Captain Croissandwich from the roguelike discord for
                donating early gallery exports, PlasticHeart for creating the{" "}
                <a href="https://github.com/plhx/cogfont">Cog and Smallcaps font files</a>, and Kyzrati for making
                Cogmind.
            </p>
            <details>
                <summary>Other website credits</summary>
                <table className="credits-table">
                    <tbody>
                        <tr>
                            <th>Library</th>
                            <th>License</th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://www.chartjs.org/">Chart.js</a>
                            </th>
                            <th>
                                <a href="https://github.com/chartjs/Chart.js/blob/master/LICENSE.md">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://floating-ui.com/">Floating-UI</a>
                            </th>
                            <th>
                                <a href="https://github.com/floating-ui/floating-ui/blob/master/LICENSE">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://lesscss.org/">less</a>
                            </th>
                            <th>
                                <a href="https://github.com/less/less.js/blob/master/LICENSE">Apache 2.0</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://pieroxy.net/blog/pages/lz-string/index.html">lz-string</a>
                            </th>
                            <th>
                                <a href="https://github.com/pieroxy/lz-string/blob/master/LICENSE.md">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://react.dev/">React</a>
                            </th>
                            <th>
                                <a href="https://github.com/facebook/react/blob/main/LICENSE">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://react-chartjs-2.js.org/">React Chartjs 2</a>
                            </th>
                            <th>
                                <a href="https://github.com/reactchartjs/react-chartjs-2/blob/master/LICENSE">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://react-dropzone.js.org/">React Dropzone</a>
                            </th>
                            <th>
                                <a href="https://github.com/react-dropzone/react-dropzone/blob/master/LICENSE">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://react-select.com/home">React Select</a>
                            </th>
                            <th>
                                <a href="https://github.com/JedWatson/react-select/blob/master/LICENSE">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://react-window.vercel.app">React Window</a>
                            </th>
                            <th>
                                <a href="https://github.com/bvaughn/react-window/blob/master/LICENSE.md">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://tanstack.com/table/latest">TanStack Table</a>
                            </th>
                            <th>
                                <a href="https://github.com/TanStack/table/blob/main/LICENSE">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://www.typescriptlang.org/">Typescript</a>
                            </th>
                            <th>
                                <a href="https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt">Apache 2.0</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://usehooks-ts.com/">Usehooks-ts</a>
                            </th>
                            <th>
                                <a href="https://github.com/juliencrn/usehooks-ts/blob/master/LICENSE">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://vitejs.dev/">Vite</a>
                            </th>
                            <th>
                                <a href="https://github.com/vitejs/vite/blob/main/LICENSE">MIT</a>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <a href="https://github.com/molefrog/wouter">Wouter</a>
                            </th>
                            <th>
                                <a href="https://github.com/molefrog/wouter/blob/v3/LICENSE">Unlicense</a>
                            </th>
                        </tr>
                    </tbody>
                </table>
            </details>
        </div>
    );
}
