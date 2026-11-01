const fallbackImage = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=85';

export default function HomeHero({ image, children }) {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden rounded-lg bg-text text-surface">
      <img src={image || fallbackImage} alt="" fetchPriority="high" onError={event => {
        if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
      }} className="venue-photo absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/80 via-black/50 to-black/15" />
      <div className="flex min-h-88 flex-col justify-center gap-6 px-4 py-8 sm:min-h-100 sm:px-12 sm:py-12 lg:px-16">
        <div className="max-w-2xl space-y-3">
          <p className="border-l-4 border-accent pl-3 text-caption font-semibold tracking-widest">YOUR NEXT GETAWAY STARTS HERE</p>
          <h1 id="hero-heading" className="text-[1.875rem] leading-9 font-bold sm:text-display sm:leading-14">Find somewhere<br /><span className="text-accent">worth staying</span></h1>
          <p className="max-w-md text-small sm:text-body">Cabins, apartments and every stay in between. Find your next escape.</p>
        </div>
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </section>
  );
}
