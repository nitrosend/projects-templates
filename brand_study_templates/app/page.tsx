import { Collection } from "../components/collection";
import catalog from "../data/catalog.json";
import type { Template } from "../components/collection";

function Logo() {
  return <a className="logo" href="https://nitrosend.com" aria-label="Nitrosend home">
    <img className="logo-icon" src="/nitrosend-icon.png" width="40" height="40" alt="" />
    <span className="logo-wordmark"><img src="/nitrosend-wordmark.png" width="211" height="28" alt="Nitrosend" /></span>
  </a>;
}
export default function Home() {
  return <>
    <a className="skip-link" href="#collection">Skip to templates</a>
    <header className="site-header"><Logo /><nav aria-label="Main"><a href="#collection">Email templates <span aria-hidden="true">↗</span></a></nav></header>
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">Email<br />worth<br />opening<span>.</span></h1>
          <p>Start with a standout design.<br /> Make it yours.</p>
          <a className="button button-primary" href="#collection">Explore templates <span aria-hidden="true">↗</span></a>
          <small>No signup to start.</small>
        </div>
        <figure className="hero-art">
          <img src="/campaign-artwork.png" alt="Campaign art direction for Nike, Notion and The Ordinary, created in Nitrosend." width="1620" height="972" fetchPriority="high" />
          <figcaption><span>Nike</span><span>Notion</span><span>The Ordinary</span></figcaption>
        </figure>
      </section>
      <div className="hero-foot"><p><strong>36 brands.</strong> Hundreds of starting points.</p><p>Independent concepts made in Nitrosend.</p></div>
      <Collection templates={catalog.templates as Template[]} />
      <section className="closing" aria-labelledby="closing-title">
        <p className="eyebrow">FROM INSPIRATION TO YOUR NEXT SEND</p>
        <h2 id="closing-title">Your brand.<br />Your next great email<span>.</span></h2>
        <div><p>Pick a design. Change the words, images and colours.<br />Make something worth opening.</p><a href="#collection" className="button button-primary">Find your starting point <span aria-hidden="true">↗</span></a></div>
      </section>
    </main>
    <footer className="site-footer"><Logo /><p>Brand studies are independent creative concepts.<br />Brand names belong to their respective owners.</p><a href="https://nitrosend.com">Made with Nitrosend <span aria-hidden="true">↗</span></a></footer>
  </>;
}
