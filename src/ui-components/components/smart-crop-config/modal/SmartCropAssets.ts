import { SelectedImage } from "../../../../common/Types";
import { MarkerData } from "../../../../models/MarkerData";
import { UnitType } from "../../../enums";

interface AssetsDataMarkers {
  category: string;
  confidence: number;
  markers: Object;
}

interface AssetsData {
  number_of_markers: number;
  schema: number;
  markers: AssetsDataMarkers[];
}

export interface Asset {
  id: string;
  signed_s3_url: string;
  data: AssetsData;
}

export default class SmartCropAssets {
  private mapAssets: any;

  constructor(entries: Asset[]) {
    this.mapAssets = new Map();
    entries.forEach(asset => {
      if (asset.id === "4-758968850") return;
      this.mapAssets.set(asset.id, asset);
    });
  }

  getAllAssets() {
    return this.mapAssets;
  }

  getAllAssetsId() {
    let ids: string[] = [];
    this.mapAssets.forEach((asset: Asset) => {
      ids.push(asset.id);
    });
    return ids;
  }

  getImageById(id: string): SelectedImage {
    let asset = this.mapAssets.get(id);
    return {
      url: asset.signed_s3_url,
      id: asset.id
    };
  }

  getCoordinatesByMarker(selectedMarker: string, id: string): MarkerData[] {
    let asset = this.mapAssets.get(id);
    if (asset) {
      let coordinates: MarkerData[] = [];
      asset.data.markers.forEach((a: any) => {
        Object.keys(a.markers).forEach(marker => {
          if (marker === selectedMarker) {
            const m = a.markers[marker];
            const unit = m.unit === "%" ? UnitType.PERCENTAGE : UnitType.PIXELS;
            const markerData = new MarkerData(m.x, m.y, m.width, m.height, unit);
            coordinates = [...coordinates, markerData];
          }
        });
      });
      return coordinates;
    }
    return [];
  }

  getAllMarkerOptionsById(id: string) {
    let markerOptions: string[] = [];
    let asset = this.mapAssets.get(id);

    if (!asset) return [];

    if (asset.data.number_of_markers === 1) {
      /*
       * For single crop
       */
      const markers = asset.data.markers[0].markers;
      Object.keys(markers).forEach((marker: string) => {
        markerOptions.push(marker);
      });
    } else {
      /*
       * For multiple cropping
       */
      const markers = asset.data.markers;
      const setOfMarkers = new Set();
      markers.forEach((m: any) => {
        const markerKeys = Object.keys(m.markers);
        markerKeys.forEach((marker: string) => {
          setOfMarkers.add(marker);
        });
      });
      const sortedMarkers: string[] = Array.from(setOfMarkers).sort() as string[];
      if (sortedMarkers) {
        markerOptions = [...sortedMarkers];
      }
    }
    return markerOptions;
  }
}
