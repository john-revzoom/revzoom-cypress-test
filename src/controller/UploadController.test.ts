import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UploadController } from "./UploadController";
import { UploadReporterAdapter } from "./UploadReporter";
import _ from "lodash";

function createSampleFile(fileName: string) {
  return new File(["I am random"], fileName, { type: "text/html" });
}

describe("Upload controller tests", () => {
  let uploadController = new UploadController(new UploadReporterAdapter());

  it("delete all method call must call cancelUploads method.", () => {
    let cancelUploads = jest.spyOn(uploadController, "cancelUploads");
    uploadController.delete([], true, []);
    expect(cancelUploads.mock.calls.length).toBe(1);
    cancelUploads.mockRestore();
  });

  it("delete all with exclude items.", () => {
    let startMethodSpy = jest.spyOn(uploadController, "start");
    let onDeleteSpy = jest.spyOn(uploadController, "onDelete");
    startMethodSpy.mockImplementation(_.noop);
    const file1 = createSampleFile("file-name-1.jpeg");
    const file2 = createSampleFile("file-name-2.jpeg");
    uploadController.onFilesDrop([file1, file2]);
    //At this time queue length must be 2.
    expect(uploadController.getTotal()).toBe(2);
    let uiId = uploadController
      .getFiles()
      .filter(i => i.getName() === file2.name)[0]
      .getUiId();
    //Delete all with excluding one item.
    uploadController.delete([], true, [uiId]);
    //Now, length must be 1;
    expect(uploadController.getTotal()).toBe(1);
    //When item is removed, onDelete event must be called.
    expect(onDeleteSpy.mock.calls.length).toBe(1);

    //Delete all with no excludes.
    uploadController.delete([], true, []);
    //Now, length must be 0;
    expect(uploadController.getTotal()).toBe(0);
    expect(onDeleteSpy.mock.calls.length).toBe(1);
    onDeleteSpy.mockRestore();
    startMethodSpy.mockRestore();
  });
});
