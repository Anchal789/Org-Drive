import DashGrid from "@/components/dashboard/DashGrid";
import DriveDropOverlay from "@/components/dashboard/DriveDropOverlay";
import DashGridWrapper from "@/components/dashboard/DashGridWrapper";

export default function Page() {
  return (
    <DashGridWrapper overlay={<DriveDropOverlay />}>
      <DashGrid />
    </DashGridWrapper>
  );
}
