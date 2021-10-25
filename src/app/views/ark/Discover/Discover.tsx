import React, { useEffect, useState } from "react";
import { Box, Checkbox, Container, FormControl, FormControlLabel, FormLabel, InputAdornment, OutlinedInput, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/crypto";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { ArkImageView, CurrencyLogo } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain } from "app/saga/selectors";
import { Collection } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { ArkClient } from "core/utilities";
import { ReactComponent as CheckedIcon } from "./checked-icon.svg";
import { ReactComponent as UncheckedIcon } from "./unchecked-icon.svg";
import { ReactComponent as VerifiedBadge } from "./verified-badge.svg"

interface SearchFilters {
  [prop: string]: boolean;
}

const SEARCH_FILTERS = ["profile", "artist", "collection"]

type CellAligns = "right" | "left" | "inherit" | "center" | "justify" | undefined;
interface HeadersProp {
  align: CellAligns;
  value: string;
}
const HEADERS: HeadersProp[] = [
  { align: "left", value: "Collection" },
  { align: "center", value: "Volume" },
  { align: "center", value: "Floor" },
  { align: "center", value: "24 Hour %" },
  { align: "center", value: "7 Day %" },
  { align: "center", value: "Owners" },
  { align: "center", value: "Collection Size" },
]

const mockedDaily = new BigNumber(23.23)
const mockedWeekly = new BigNumber(-1.23)

const Discover: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const [search, setSearch] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<SearchFilters>({
    profile: true,
    artist: true,
    collection: true,
  });

  // fetch collections (to use store instead)
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const getCollections = async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.listCollection();
      setCollections(result.result.entries);
    };

    getCollections();
  }, [network]);

  const handleSearchFilter = (value: string) => {
    setSearchFilter(prevState => ({
      ...prevState,
      [value]: !prevState[value]
    }))
  }

  return (
    <ArkPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Typography className={classes.topBarTitle} variant="h1">Featured</Typography>
          <Typography className={classes.titleDescription} variant="h4">Top NFTs at a glance. Ranked by volume, price, number of owners, and assets.</Typography>
        </Box>
        {/* 
        <CardActionArea
          component={RouterLink}
          //   to={`/ark/collections/${toBech32Address("ab")}`}
          to={`/ark/collections/mocked`} // TODO: unmock it
        >
          <CardMedia
            // TODO: unmock it
            className={classes.image}
            component="img"
            alt="NFT Collection"
            height="308"
          // image={token.asset?.url}
          />
        </CardActionArea> */}

        <OutlinedInput
          placeholder="Search for an artist or a collection"
          value={search}
          fullWidth
          classes={{ input: classes.inputText }}
          className={classes.input}
          onChange={(e) => setSearch(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel focused className={classes.formLabel}>By</FormLabel>
                {SEARCH_FILTERS.map((filter) => (
                  <FormControlLabel
                    key={filter}
                    className={classes.formControlLabel}
                    value={filter}
                    control={
                      <Checkbox
                        className={classes.radioButton}
                        onChange={(e) => handleSearchFilter(filter)}
                        checkedIcon={<CheckedIcon />}
                        icon={<UncheckedIcon />}
                        disableRipple
                        checked={searchFilter[filter]}
                      // checked={false}
                      />
                    }
                    label={filter.toUpperCase()}
                  />
                ))}
              </FormControl>
            </InputAdornment>
          }
        />
        {/* TODO: convert OutlinedInput to Autocomplete  */}
        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                {HEADERS.map((header, index) => (
                  <TableCell
                    key={`offers-${index}`}
                    className={classes.headerCell}
                    align={header.align}
                  >
                    {header.value}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>

              {collections.map((collection) => {
                const collectionStats = ArkClient.parseCollectionStats(collection);
                console.log('collectionStats', collectionStats)
                return (
                  <TableRow key={collection.address} className={classes.tableRow} component={RouterLink} to={`/ark/collections/${toBech32Address(collection.address)}`}>
                    <TableCell className={cls(classes.bodyCell, classes.firstCell)}>
                      <Box display="flex" alignItems="center">
                        <div className={classes.index}>1</div>
                        <ArkImageView
                          imageType="avatar"
                          className={classes.avatar}
                          imageUrl={collection.profileImageUrl}
                        />
                        <Box display="flex" flexDirection="column" className={classes.collectionName}>
                          <Box display="flex">
                            <div>
                              {collection.name}
                            </div>
                            <VerifiedBadge className={classes.verifiedBadge} />
                          </Box>
                          <Typography>By {collection.ownerName}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center" className={classes.bodyCell}>

                      <Box display="flex" alignItems="center" justifyContent="center">
                        <strong className={classes.amount}>
                          {collectionStats.volume ?? "-"}
                        </strong>
                        <CurrencyLogo currency="ZIL" className={classes.currencyLogo} />
                      </Box>

                    </TableCell>
                    <TableCell align="center" className={classes.bodyCell}>
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <strong className={classes.amount}>
                          {collectionStats.floorPrice ?? "-"}
                        </strong>
                        <CurrencyLogo currency="ZIL" className={classes.currencyLogo} />
                      </Box>
                    </TableCell>
                    <TableCell align="center" className={cls(classes.percentCell, { [classes.isNegative]: mockedDaily.isNegative() })}>
                      {/* {mockedDaily.isPositive() ? '+' : ''}{mockedDaily.toFormat(2)}% */}
                    </TableCell>
                    <TableCell align="center" className={cls(classes.percentCell, { [classes.isNegative]: mockedWeekly.isNegative() })}>
                      {/* {mockedWeekly.isPositive() ? '+' : ''}{mockedWeekly.toFormat(2)}% */}
                    </TableCell>
                    <TableCell align="center" className={classes.numberCell}>
                      {collectionStats.holderCount ?? "-"}
                    </TableCell>
                    <TableCell align="center" className={cls(classes.numberCell, classes.lastCell)}>
                      {collectionStats.tokenCount ?? "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ArkPage>
  );
};

export default Discover;

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
    "& .MuiRadio-colorSecondary.Mui-checked": {
      color: "rgba(222, 255, 255, 0.5)",
    },
  },
  input: {
    paddingLeft: "8px",
    paddingRight: "8px",
    marginTop: theme.spacing(2),
    borderColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.5)" : "rgba(0, 51, 64, 0.2)",
    marginBottom: theme.spacing(5),
  },
  inputText: {
    fontSize: "16px!important",
    padding: "18.5px 14px!important",
  },
  formControl: {
    flexDirection: "row",
  },
  formLabel: {
    alignSelf: "center",
    fontWeight: 700,
    marginRight: theme.spacing(2),
  },
  formControlLabel: {
    "& .MuiTypography-root": {
      fontFamily: "'Raleway', sans-serif",
      fontWeight: 900,
    },
  },
  radioButton: {
    padding: "6px",
    '& svg > path': {
      fill: theme.palette.text!.primary,
    },
    "&:hover": {
      background: "transparent!important",
    },
  },
  titleDescription: {
    color: theme.palette.type === "dark" ? "#26D4FF" : "#003340",
    marginBottom: "20px",
    "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    "-webkit-text-stroke-width": "1px",
  },
  image: {
    borderRadius: "0px 0px 10px 10px!important",
  },
  headerCell: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    padding: "8px 0 0 0",
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '0.2px',
    opacity: 0.5,
    borderBottom: 'none',
  },
  tableRow: {
    padding: 12,
    height: 72,
    background: theme.palette.type === "dark" ? "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)" : "rgba(222, 255, 255, 0.5)",
  },
  // TODO: reduce bodyCell, percentCell and numberCell
  bodyCell: {
    padding: "8px 16px",
    maxWidth: 200,
    margin: 0,
    borderTop: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "20px",
    lineHeight: "16px",
    color: theme.palette.text?.primary,
  },
  percentCell: {
    extend: 'bodyCell',
    fontSize: 18,
    color: '#00FFB0',
  },
  numberCell: {
    extend: 'bodyCell',
    fontSize: 18,
  },
  firstCell: {
    borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  lastCell: {
    borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  amount: {
    fontWeight: 800,
  },
  table: {
    borderCollapse: 'separate',
    borderSpacing: '0px 12px',
  },
  currencyLogo: {
    margin: theme.spacing(0, 1),
    "& svg": {
      display: "block",
    }
  },
  avatar: {
    height: 40,
    width: 40,
  },
  rowText: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "18px",
    lineHeight: "16px",
    color: theme.palette.text?.primary,
  },
  verifiedBadge: {
    marginLeft: "4px",
    width: "20px",
    height: "20px",
    verticalAlign: "text-top",
  },
  index: {
    margin: "0px 14px",
  },
  collectionName: {
    marginLeft: "14px",
  },
  isNegative: {
    color: theme.palette.error.main,
  },
  topBarTitle: {
    fontSize: "48px",
    margin: "0 0 48px 0px",
  },
}));
