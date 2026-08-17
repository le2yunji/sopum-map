import { SparkleIcon } from "@/components/icons/SparkleIcon";

export function HomeBrandMessage() {
  return (
    <section className="mx-4 mt-9 text-center">
      <SparkleIcon
        aria-hidden="true"
        className="mx-auto size-8 text-green-400"
      />

      <p className="mt-3 text-12 leading-6 text-black-800">
        작은 것들을 소중히 여기는 마음이
        <br />
        당신의 하루를 더 특별하게 만들 거예요.
      </p>

      <p className="mt-2 text-10 text-black-400">— 나만의 소품지도</p>
    </section>
  );
}
