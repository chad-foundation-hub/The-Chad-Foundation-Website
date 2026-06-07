import React, { useState } from "react";
import "./StoriesOfHeart.css";
import GiftOfArtNavigation from "../GiftOfArtNavigation";

// Import a unique photo for each story
import PhotoOne from "../../../../images/GiftOfArt-Images/stories-image1.png";
import PhotoTwo from "../../../../images/GiftOfArt-Images/stories-image2.JPG";
import PhotoThree from "../../../../images/GiftOfArt-Images/stories-image3.jpg";
import PhotoFour from "../../../../images/GiftOfArt-Images/stories-image4.png";
import PhotoFive from "../../../../images/GiftOfArt-Images/stories-image5.jpg";

const StoriesOfHeartCard = ({
  personsName,
  personsSchool,
  photo,
  initialStoryText,
  expandedStoryText,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  // Split expanded text into paragraphs by blank lines
  const renderParagraphs = (text) =>
    text
      .trim()
      .split(/\n\s*\n/)
      .map((para, idx) => (
        <p key={idx} className="storiesOfHeart-text">
          {para.trim()}
        </p>
      ));

  return (
    <div className="storiesOfHeart-card">
      <img
        src={photo}
        alt={`${personsName}'s story`}
        className={`storiesOfHeart-image ${isExpanded ? "expanded" : ""}`}
      />

      <h4 className="storiesOfHeart-name">{personsName}</h4>
      <p className="storiesOfHeart-school">{personsSchool}</p>

      {/* initial visible text */}
      <p className="storiesOfHeart-text">
        {initialStoryText}
        {!isExpanded && (
          <span
            className="storiesOfHeart-readMore-button"
            onClick={toggleExpansion}
          >
            {" ..read more"}
          </span>
        )}
      </p>

      {/* expanded paragraphs */}
      {isExpanded && (
        <div className="storiesOfHeart-expanded">
          {renderParagraphs(expandedStoryText)}
          <span
            className="storiesOfHeart-readMore-button"
            onClick={toggleExpansion}
          >
            {" ..read less"}
          </span>
        </div>
      )}
    </div>
  );
};

const StoriesOfHeart = () => {
  return (
    <section className="StoriesOfHeart-Two">
      <GiftOfArtNavigation currentPage="heart-stories" />
      <div className="main-container">
        <p className="storiesOfHeart-p">
          Chad’s friends would ask, “Why is he talking to that ‘stranger’ for
          hours?” Chad had unquenchable curiosity. Whether you were 4 or 94, he
          wanted to know everything about you—who you were, where you came from,
          what you’re doing, and where you’re going. He truly cared about your
          journey. So, STORIES OF THE HEART is just a continuation of Chad’s
          legacy to know more about “you” and your unique Story of the Heart. We
          hope you will enjoy the journey of those you meet!
        </p>

        <h2 className="storiesOfHeart-header">Stories of the Heart</h2>

        <div className="storiesOfHeart-container">
          <StoriesOfHeartCard
            personsName="Phil Dunn, ESQ"
            // personsSchool="ESQ"
            photo={PhotoOne}
            initialStoryText="I discovered lawn bowling for the first time while living in Manchester, England, in 1967. I was
born in England, but I moved to California when I was six and then returned for a visit when I
was 19. During that visit, which lasted eight months, my uncle Bill took me to a lawn bowling
green. We threw the bowl up and down a few times, and I never touched a bowl again or
thought much about it until 2006, 39 years later. I had some fun hitchhiking around France,
England, and Italy, while earning money as a janitor, a soft furnishings salesperson, a door-to-
door encyclopedia salesman, and finally as a bus conductor on the double-decker buses in
Manchester.
"
            expandedStoryText={`I thought about living there, but the reality of being impoverished set in, along
with a dislike for the dreary weather, and I realized that there is no place like the USA. I
discovered in that eye-opening adventure that opportunity was here, not there, and gratefully
returned to California, land of sunshine, surfing, and beautiful women.

I returned to California with new enthusiasm to complete my college education. I successfully
graduated with a Bachelor of Science degree in Business in 1970. Unfortunately, the Vietnam
War was in full swing, and my lottery number was 37, which meant I was going to be drafted
and probably sent to Vietnam. At the time, after a negative run-in with the law, I decided that I
might like to be an attorney. Knowing I would be drafted, I volunteered for the Army, hoping to
survive the war and then use the GI Bill to get through law school. I was pretty poor at the
time, and the G.I. Bill was my only hope for extending my education. The plan worked better
than I could have ever imagined. I was fortunate enough to be able to talk my way into serving
in the Judge Advocate General’s Office (JAG), where several outstanding lawyers educated me
on the fundamentals of being a good lawyer. I was like a sponge while serving as the Chief Law
Clerk, Bailiff, Court Reporter, and on many occasions, sitting at the counsel table assisting either
the prosecution or defense. I survived with only a broken ankle sustained during basic combat
training (enough to be classified as an honorably discharged disabled veteran). There are many
back stories to all these adventures, but unfortunately, not enough space here to go into them
all. Suffice to say that I served my full term in the service, was honorably discharged, and then
made it to law school, which I attended at night, while working during the day for several
judges at the L.A. County Courthouse and Public Defender’s Office. When I graduated, I was
quite experienced, having spent two years in JAG and three years working at the courthouse, so
I was eager to get out there and into a courtroom. I passed the bar the first time, was sworn in
at noon, and appeared at my first hearing at 5 p.m., successfully settling the case for three
times what the attorney for whom I was appearing wanted. A new attorney friend I met a
couple of days after starting work in the same office, noticed that result and asked if I would
like to go into partnership with him. I told him I only had $500 to my name, a desk, and a
typewriter. I asked what he had, and he replied I only have $300, no desk, and no typewriter.
Despite our impoverished condition, we formed the partnership of Dunn & Roth, figuring
neither of us had anything to lose. The practice took off, and almost fifty years later, it still
exists, albeit now with different names in the title. 

I‘m proud to say that I was a highly successful  trial attorney, having tried numerous cases before judges and juries between 1977 and 2009. Winning was important to me, much more than the money. I won well over 90% of all the cases I tried. I attribute my success to having had 25 different jobs in my life before becoming a lawyer. Thus, I could relate to just about
everyone, which is helpful when trying cases before juries and also when interacting with
clients. It was not until I slowed down my trial work that I discovered lawn bowling. I believe
that my competitive nature, developed in the courtroom, helped me succeed on the greens.
In 2006, my sports were karate and tennis. I had attained a second-degree black belt (Nidan) in
Yoshukai Karate and was even teaching, but it required a fair amount of sparring and kicking,
which, at my age of 58, was no longer what I wanted to do. I was also getting tired of getting
hit and kicked in the face. In addition, my hip was starting to feel a little funny, so tennis was
also becoming challenging. While playing tennis at Douglas Park in Santa Monica, my friend
and I stopped by the green and were warmly welcomed. It was July 2006 when this new
adventure began to unfold in my life. Bowling came naturally to me, and although I didn’t play
much the first year, I got hooked when my buddy Amo and I entered the Novice Pairs
tournament held on what was then a grass green at Laguna Woods. Much to our delight, we
won the tournament, and the addiction began. That was followed by winning the U.S. Open
Pairs in 2007, possibly the only person to win a U.S. Open as a novice.

I then met a seasoned bowler named James McGinnes, who advised me that to improve quickly
at bowls, I should participate in as many tournaments as possible. That was sage advice which I
took to heart. In my second year, still as a Novice, I won the novice singles, the Cary, the So Cal
Triples (which I’ve won five more times since then), the Tommy Stirrat, the PBA pairs, the SMBC
singles, among other tournaments, and made team SW honors. Although they didn’t keep
statistics very closely in those years, I believe I ended up either number one in the Southwest or
very close to it. My hard work did not go unrecognized, and Ed Quo, the Chief Team USA
Selector, called me to ask if I would like to play in the World Cup Singles. At the time, I was still
a novice. I was also still quite busy with my law practice, but I wasn’t about to turn down that
honor. Every year, one person from the USA is chosen to compete in the World Cup Singles
tournament. The practice of law would have to take second chair to the World Cup. That was
the beginning of my journey on Team USA and representing the USA around the World. Since
then, I have had the honor of representing the USA in Mainland China, Hong Kong, Australia,
New Zealand, the USA, Canada, Wales, Scotland, England, the Netherlands, and Cyprus.
England, Scotland, and Wales were part of the World Bowls Tour and PBA blue carpet
adventure.

To say bowls took over my life would be an understatement. On 18 occasions, I have been
blessed with the opportunity to compete on the World stage on behalf of the USA. I am both
grateful and humbled by what this sport has brought into my life. More importantly, a
multitude of friendships have been formed during this time period. I often tell new bowlers
that you are going to love this sport because you will make friends with people from all over the
World. In addition, we are all equals out on that playing surface. You could be the local janitor
or the local doctor, and it doesn’t matter. We are all equal on the green, and nobody cares
what you do; they care about how friendly you are and how you play the game.

To give back to the sport that has given me so much, I served on the board at SMBC for five
years, as VP for three years, and as President for one year.  I’m currently the Chair of the SW
Disciplinary Committee and was briefly a Team USA Selector. I also became a certified coach
and umpire. My philosophy is that it is essential in bowls, with so few of us, to volunteer in any
way you can. A club’s success is very much tied to the willingness of its members to help run
the club. My colleague and friend Tom and I are currently co-authoring a book on the sport of lawn bowling. It’s our way of giving back a little to the sport that has given us so much.

- Cheers! Phil
`}
          />

          <StoriesOfHeartCard
            personsName="Yulia Shtofa"
            photo={PhotoTwo}
            initialStoryText="My name is Yulia Shtofa. I was born and live in Kyiv, in Ukraine. This is our home and always will be. When Russia attacked our country in February 2022, it was the most frightening and devastating experience of our lives, especially since our newly born son was only 2 years old when the invasion came. My husband’s sister and her husband live in the US and were very upset and offered to move us to a safe country, but we refused to leave. The Ukraine is our homeland and Kyiv is ‘our home,’ and we will do whatever it takes to survive and defend it for as long as it takes. As the war progressed, things got very bad. My sister-in-law asked what she could send us. Even basic things like underwear, socks, and toothbrushes were not available as most of the stores were shuttered. We are very grateful to our American family and the countries of the world who care and support us.
"
            expandedStoryText={`Our spirit is strong and enduring. I recently posted on Instagram that one of my dreams has come true. All my life, I have wanted to learn to drive. In 2025, I completed my driving lessons, took my driver’s test, and passed. Now, I proudly have my driver’s license. Yeah! We don’t have a car yet but when times are better and we can get one, I will be able to drive it. Life and Dreams continue to exist, even in the worst of times.
								
            - Yulia Shtofa, Kyiv, Ukraine
              `}
          />

          <StoriesOfHeartCard
            personsName="Phil Oberlander"
            photo={PhotoThree}
            initialStoryText="I was born in Paris, and my parents moved to Montreal after the German invasion of WW II. My father was a European champ in wrestling for 2 years, on his way to the Olympics when they were boycotted in ‘36. When I grew up, I followed in his footsteps; excelling in wrestling I made it to the Olympic finals.  (I still have cauliflower ears as a permanent signature.)
Always wanting to be a good son, I did all the right things: competitive athletics, finishing college in New York City, marrying, succeeding in a top sales career, even buying a building in Harlem. Living the ‘American dream.’ But somewhere along the road, that dream shattered…big-time and I became all-consumed by the culture of the era, ‘crack cocaine.’ Once attired in Brooks Brothers suits, I was now the owner of a crackhouse and a member of the dark souls of society. I lost it all; I became the pariah of my family.
"
            expandedStoryText={`The thing that saved my life? I had unrelenting friends who cared; successful people who did intervention after intervention. I was in and out of recovery from 1991-2004. Somewhere in that lost soul, I was searching for my self-respect, so I could regain the respect of my family. It was a gut-wrenching journey, many years in the making, but I refound myself and started a new chapter. I went back to college, got my master’s degree in Sociology, and became a Social Worker at the largest Homeless Drop-in Center in New York City. It was these trials through hell that enabled me to understand, inspire, and support the disenfranchised for 20 years and regain the trust and love of my children and family. 

Something else surprising happened when I made the decision to change my life. I always had this dream to be an actor. In fact, I was sometimes told I resemble Anthony Hopkins, and one day the great actor and I passed each other in the street and did a doubletake! Well, it happened that our Director of Development at the Drop-in Center was also an actor. She had written a play called, “All About Sneakers,” and she offered me the role of John, The Gravedigger—the mentor, who helps young Danny through his own challenges. My dream did come true! We performed ‘Sneakers’ at an Off-Broadway venue in the West Village and had special performances set aside for our homeless clients. 

My journey through hell was transformative. I learned life can throw you punches that can keep you knocked out for years. And it is the loyal, caring friends who never give up on you, and your family who need their son, father, husband and friend back that smack you hard and wake you up. It is to them; I am eternally grateful for the rest of my life.
								
- Philip Oberlander
`}
          />
          <StoriesOfHeartCard
            personsName="Jorge Guzman"
            photo={PhotoFour}
            initialStoryText="My name is Jorge Guzman. I was born in a town named Mayarí, province of Holguín, in the eastern part of Cuba just 15 days before the dictatorship of Fidel Castro took over.  My mother always told me that I had been born under the sound of bullets. My life growing up as child was kind of normal but as a teenager, my way of thinking started to change. I discovered American pop music in the 70’s through Miami radio stations that used to sneak in through Cuban airwaves. Since it was banned in Cuba, I remember locking myself in my room to listen to American pop music of the day. You could really get into trouble if you were caught doing that. It changed my life. I felt compelled to learn English by myself because I wanted to understand everything they were saying or singing.  It opened my eyes in ways that can’t be explained."
            expandedStoryText={`At 17, I decided that I needed to get out of Cuba, if I wanted to be completely free of that ideology. We were always taught in school and by the government-owned media that Communism was right and everything else was wrong. 

              As my English started to improve, I listened to radio stations from all over the world and was able to realize all the lies that the government was instilling in our minds. In 1983, I got a master’s degree in education in the field of Chemistry. Now, I was able to see from inside the kind of education that government wanted teachers to teach students.  I enjoyed teaching and interacting with young minds. This is where my problem began – it was the beginning and the end for me.  My mind and my mouth were too big. I was disgusted but I had to survive someway and went along with it. After a while, I began to speak about my ideas and opinions with friends and acquaintances.  In Cuba, anyone can be a snitch and tell the secret police what you have been talking about with people. It landed me in hot water and the Seguridad del Estado (the secret police) started to harass me. 

              The situation in Cuba had worsened after  the Soviet Union disappeared. Even the basic things you need in everyday life vanished overnight. Harassment towards me and my ideas became commonplace. Everything came crashing down in 1993, when I decided that I’d had enough, and tried to leave the country in a raft with a group of friends. That endeavor didn’t end well since we were caught in the middle of the ocean by Cuban coastguards, who took us back to Cuba. They threw me in jail for a couple of days and, as expected, they fired me from my job as a teacher. The reason behind it was clear. If you try to leave the country, it means that you don’t agree with the government, therefore, you can’t be trusted to teach students about communism. 

              My hometown’s Catholic Church gave me the emotional shelter that I needed, and I became very active in the community. It was the place where I felt most free. I was able to help the community and express my ideas more freely. Of course, it didn’t sit well with the secret police, and they continued to harass me by showing up at my house and searching it without any warrant, looking for “any document that could tie me to any subversive group”. They could never find anything. The priests in my church saw that I was in constant danger of being “disappeared” and in 1999, they got me a visa to Mexico. That was the start of my escape to freedom. The police didn’t interfere. They probably thought that they were getting rid of the opposition. I stayed in the City of Monterrey in Mexico for about 3 months. Four friends of mine who had escaped from Cuba to Venezuela before the Chavez dictatorship took over had been living there for some years.  They were once again escaping another dictatorship. This time Hugo Chavez’s. They contacted me to ask me whether I wanted to go to the United States. I said yes immediately. After all, that was the ultimate goal of mine. One hopeful day in October, we all met in Reynosa, a border town on the Mexican side, and by recommendations from other Cubans that had crossed the Rio Grande before us, we secured a passing though the river with the help of some coyotes that we could trust, after paying them, of course. 

              We were a group of 6. The crossing looked like it had been taken from a movie. We spent the day at the coyote’s house. We waited until nightfall. It all had to be done in the dark. We got into 2 cars as if we were hiding from the Nazis. It turns out that neighbors could call the police if they saw something out of the ordinary going on. These border towns have always had their share of immigration issues going on. We got into the cars as quickly as we could and took off for the river. Upon arriving at the river, the driver told us to quickly run out of the car towards the river shore. There, his “assistants” were waiting for us. They had 3 tractor inner tubes big enough to hold 2 people each inside it, with our legs hanging in the water. All we had to do was stay still as they pushed the tubes with us inside to the American side. All of this was done in complete silence. Once we got to the other side, they told us to run as far as we could into town as they returned to Reynosa. The town’s name was McAllen, Tx. After that, it was all on us, but we knew what we had to do. We needed to surrender to the police. By law, we couldn’t be returned back to Cuba, and we had brought our birth certificates with us, well protected with lots of plastic wrapping, to stop them from getting wet in the river,  as we needed to prove that we were indeed Cubans. After walking through town for a good half an hour, we saw a police car and we did what we had planned all along.

              They booked us into a cell. We didn’t care. We were finally in the land of the free. Surprisingly for us, only 4 of us, who were a family, husband, wife and two kids, were granted passage to Florida. My friend and I were taken to a  refugee camp in Harlingen, Texas, where we stayed for three months waiting for our release. You see, laws in Texas are different from Florida laws. In Florida, we wouldn’t have stayed in a camp for so long. 

              We were released in December 1999. We all went our separate ways although we stayed in touch. A dear cousin of mine took me in. In less than 3 months, I had already found a job as a collector for a company, since I had learned English in Cuba. I met my future husband in Miami in 2000, and the next year, we moved to NYC together. I am very proud of what I have accomplished in this country. I am happily retired and happily married now. Since my retirement, I have been teaching Spanish to adults, which is something that I love. My main message to those reading this is: don’t take democracy for granted.  It can all disappear in the blink of an eye. No dictatorship is good, whether it is from the right or the left.

`}
          />
          <StoriesOfHeartCard
            personsName="Joe Connors"
            photo={PhotoFive}
            initialStoryText="Joe was born in Philadelphia and grew up in Stoneham, MA, with his parents, three older
sisters, and a close-knit, fun-loving extended family of aunts and uncles, nephews and nieces,
and cousins of Irish descent. He worked at Friendly’s and painted houses to pay his way
through college and received a partial basketball scholarship at UMass Amherst where he
played basketball with “Dr. J” (Julius Irving). After college, Joe served his country as a Peace
Corps Volunteer in the Philippines addressing trafficking and abuse of women and fearlessly
disrupted the begging syndicate’s use of ‘hiring good-looking street children’ to lure more
donations. After the Peace Corps, he continued to work in the Philippines to prevent dynamite
fishing and other social causes. In 1986, with camera in hand, he was embedded at

"
            expandedStoryText={`Camp
Aguinaldo with the People Power (“Yellow”) non-violent revolution and was the first to report that President Marcos had left the country.

Joe was a fearless adventurer who loved travelling, hiking, mountain climbing, and scuba diving all over the world. His good looks and natural ability to connect with people landed him modeling roles, commercials, and movie parts including in Wonder Women (1973) with Nancy Kwan and a cameo role as one of the helicopter gunmen in Ride of the Valkyries, Apocalypse Now, directed by Francis Ford Coppola. Enterprising and always helpful, Joe helped find a desperately needed generator for the film which Francis Ford Coppola mightily appreciated, and invited him to Hollywood. Loyal to his artisan workers in Baguio who made the jewelry for the movie, Joe remained in the Philippines. Ever the kidder who loved to make people laugh, once with his friend while in the Philippines, Joe announced unabashedly, “Hello! I’m Robert Redford and this is Jon Voight!”

Stumbling by chance to work with metals, semi-precious stones, and wood, and with an eye for
design he created unique wearable art in the U.S. and Canada creating the “Bayanihan”
(meaning “coming together as a community”) silver earring collection in the Philippines; then
partnered with a San Francisco-based artist on inlaid Intarsia jewelry (featured in Harper’s
Bazaar), and later the famous cross embedded in a crystal heart pendant, “The Quiet Cross.”
Many of his designs were sold in major jewelers like Tiffany’s, Bloomingdales, and Saks Fifth
Avenue in NYC.

As his jewelry business grew, so did his love of photography. Self-taught, Joe became world-
renowned for several famous photographs including The Capitol in Snow of the United States
Capitol. His empathy, discerning eye and journalistic instinct captured joyful interludes of people living in poverty in Mumbai slums, and playful, happy children in torn dirty clothes in Cambodia.
He connected with them on a human level, making them laugh. As destiny had it, Joe met his
beautiful wife Anne Ralte in a revolving door at Bloomingdales NYC and they spent the next 42
years together. Joe had initially caught a glimpse of Anne at the airport when she first arrived in the U.S. (1971) the same day he left for his Peace Corps assignment. Anne was born in Mizoram in northeast India. Orphaned at age 10, she grew up in a boarding school for disadvantaged children in Calcutta, West Bengal. Through the support of her loving foster parents in the US, her exceptional intelligence and fortitude, became a celebrated force for lifelong work in international development, including in blindness prevention, food aid, and humanitarian assistance. Joe was her champion, coaching her to become who she is today. He donated photography services to non-profit organizations, with emphasis on documenting blindness in Asia and Africa.

Joe faced his life challenges with a “never give up” attitude, and his ever-ready smile to help
others belied his own daily physical pain. He survived the January 1982 World Airways plane
crash into Boston Harbor that left him with persistent back pain and can be seen after the crash helping other passengers debark from the frigid waters of the bay. He miraculously survived an emergency open heart surgery with intuitive decisions and overcame stuttering as a child to become a great natural communicator. He loved his Peace Corps experience in the Philippines and told tales that prompted “tell me that story again” (and again) from his young nephews and nieces, enthralled with their dashing uncle’s adventures.

Joe was a good friend to all he met, so happy to help you no matter what the need and always
made you feel so special. He thought his job was to make people laugh and lift their spirits. His
long-time friend Beanie wrote, “If he can’t help you solve your problems, he can make you laugh so hard that you’ll forget you even had a problem to begin with.”

“Uncle Joe” to young and old, Joe changed the lives of many, spreading love and hope wherever he went. His nephew John wrote, “Joe has the rare quality of putting others before himself, just to see others flourish in their own life. That is his gift, his talent, and his true heart. He is loved and respected for the full spectrum of humanity he has the pleasure of meeting. A street sweeper in New Delhi to a Head of State, Joe has the same courtesy, respect and passion for each, and every human being.”

Deeply troubled by the January 6th event, Joe was in the process of creating awareness to
protect the U.S. Capitol as a national treasure using his renowned photo The Capitol in Snow.
Joe’s full body of work can be seen at Joe Connors Art Collections
(https://fineartamerica.com/profiles/joe-connors)  He lives on through his photos.

Joe died suddenly on Monday, December 20th, 2021, at 4:44  (Joe’s spiritual number) after entering the ER with stomach pains and surgery for twisted bowels that should have been undertaken on day one (on Saturday early morning). He died with his beloved wife, Anne by his side, who organized goodbye call-ins from family and friends, who shared his own jokes back. Joe could not speak or move but shed a tear.

Joe Connors was an extraordinary human being who emitted love and friendship his entire Life.
By “doing it different” and fearless protection for those needing help, Joe was able to change
people’s lives. It is a comfort to Anne that these values are being carried forward by the next
generation of leaders, such as Adam Dunigan, running for Congress in Virginia’s 8th district.
https://www.adam4congress.com/platform

To those who had the privilege and pleasure of knowing him, Joe was our ‘own National
Treasure!’   June 4, 1948–December 20, 2021.

`}
          />
        </div>

        <h3 className="stories-bottom-text">
          If you would like to submit a “Real-Life Story of the Heart,” please
          contact arista@chad-foundation.org.
        </h3>
      </div>
    </section>
  );
};

export default StoriesOfHeart;
