"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/Button/Button";

type HomeCourseSectionBoundaryProps = Readonly<{
  children: ReactNode;
}>;

type HomeCourseSectionBoundaryState = Readonly<{
  hasError: boolean;
}>;

/** 추천 코스 렌더링 오류가 홈의 다른 영역으로 퍼지지 않게 격리합니다. */
export class HomeCourseSectionBoundary extends Component<
  HomeCourseSectionBoundaryProps,
  HomeCourseSectionBoundaryState
> {
  state: HomeCourseSectionBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): HomeCourseSectionBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("홈 추천 코스 렌더링 오류", error, errorInfo);
  }

  /** 오류 경계를 초기화해 추천 코스 렌더링을 다시 시도합니다. */
  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section
        aria-labelledby="home-course-boundary-title"
        className="mt-9 border-y-8 border-black-100/50 px-4 py-7"
      >
        <h2 id="home-course-boundary-title" className="text-16 font-semibold">
          추천 산책 코스
        </h2>

        <div
          role="alert"
          className="mt-4 rounded-card bg-green-50 px-4 py-7 text-center"
        >
          <p className="text-14 font-medium text-green-900">
            추천 코스를 표시하지 못했습니다.
          </p>

          <Button
            variant="outline"
            size="small"
            className="mt-4"
            onClick={this.resetErrorBoundary}
          >
            다시 시도
          </Button>
        </div>
      </section>
    );
  }
}
