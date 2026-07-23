import { LoaderCircle } from "lucide-react";

export default function AdminLeadsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[90rem] items-center justify-center px-4 py-24 min-[900px]:px-8">
      <div className="flex items-center gap-3 text-body text-muted-foreground">
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin motion-reduce:animate-none"
        />
        Loading leads…
      </div>
    </div>
  );
}
