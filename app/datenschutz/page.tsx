export default function Impressum() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold">Impressum</h1>

      <div className="mt-6 space-y-6 text-sm leading-6">
        <section>
          <h2 className="font-bold">Diensteanbieter</h2>
          <p>
            Angaben gemäß § 5 TMG.<br />
            Merwis Gabriel Solorzano Diaz<br />
            Herrenbachstr. 33a<br />
            86161 Augsburg; Deutschland
          </p>
        </section>

        <section>
          <h2 className="font-bold">Kontakt</h2>
          <p>
            E-Mail: info@emigrando.de
          </p>
        </section>

        <section>
          <h2 className="font-bold">Tätigkeit</h2>
          <p>
            Selbständige Beratung und unterstützende Dienstleistungen im Bereich
            Migration; Soziales und Verwaltung; keine Rechtsberatung im Sinne
            des Rechtsdienstleistungsgesetzes; keine Vertretung vor Gericht.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Umsatzsteuer</h2>
          <p>USt-IdNr.: nicht vorhanden.</p>
        </section>

        <section>
          <h2 className="font-bold">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p>
            Merwis Gabriel Solorzano Diaz; Anschrift wie oben.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet; übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen; die auf eine
            rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung
            oder Sperrung der Nutzung von Informationen nach den allgemeinen
            Gesetzen bleiben hiervon unberührt.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter; auf deren
            Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten
            Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
            verantwortlich. Bei Bekanntwerden von Rechtsverletzungen werden wir
            derartige Links umgehend entfernen.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Urheberrecht</h2>
          <p>
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht. Die
            Vervielfältigung; Bearbeitung; Verbreitung und jede Art der
            Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
            vorherigen schriftlichen Zustimmung des jeweiligen Urhebers; soweit
            nicht eine gesetzliche Erlaubnis greift.
          </p>
        </section>

        <section>
          <h2 className="font-bold">
            Online-Streitbeilegung und Verbraucherstreitbeilegung
          </h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung bereit; abrufbar unter
            {" "}
            https://ec.europa.eu/consumers/odr.
          </p>
          <p className="mt-2">
            Der Anbieter ist nicht verpflichtet und nicht bereit; an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </section>
      </div>
    </main>
  );
}
